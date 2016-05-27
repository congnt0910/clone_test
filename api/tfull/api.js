"use strict";


var _httpRequest = require('../../lib/httpRequest');
var cheerio = require('cheerio');

var _api = function () {
    var self = this;
    self.http = new _httpRequest();
    self.http.ssl_method = 'SSLv23_method';
    self.q = require('q');

    //
    self.global = {};
    self.host = 'http://truyenfull.vn';
    self.more_info = {};
};

var api = _api.prototype;


api.get_list_chap = function (url) {
    var self = this;
    var global = {};
    return self.q.when()
        .then(function () {
            global.parse = function (body, first) {
                var $ = cheerio.load('');
                var $body = cheerio.load(body);

                if (first) {
                    var $list_chap = $body('#list-chapter');
                    if ($list_chap.length == 0) {
                        throw new Error('Not found list chapter');
                    }
                } else {
                    $list_chap = $body('div.col-xs-12');
                }
                var $class_list_chapter = $list_chap.find('.list-chapter');

                $class_list_chapter.get().forEach(function (ul) {
                    var $lis = $(ul).find('>li');
                    $lis.get().forEach(function (li) {
                        var $li = $(li);
                        global.final.push({
                            url: $li.find('a').attr('href'),
                            title: $li.text().replace(/Chương/i, '').trim()
                        });
                    })
                });


            };
            return self.http.get(url, {}, {message: "Get list chapter fail"});
        })
        .then(function (page) {
            var $ = cheerio.load('');
            var $body = cheerio.load(page.body);
            //-------------------------------------
            var $desc = $body('.desc');
            var title = $desc.find('h3.title').text().trim();
            console.log(title);
            //-------------------------------------
            global.final = [];
            global.parse(page.body, true);
            //-------------------------------------
            var truyen_id = $body('#truyen-id').attr('value');
            var total = $body('#total-page').attr('value');
            global.tid = truyen_id;
            global.totalp = total;
            global.tascii = self.to_slug(title);
            global.tname = title;
            console.log(truyen_id, total);
            //-------------------------------------

            return true;
        })
        .then(function () {
            return self.q.Promise(function (resolve, reject) {
                var page = 2;
                var url = self.host + '/ajax.php';
                var post = {
                    type: 'list_chapter',
                    tid: global.tid,
                    tascii: global.tascii,
                    tname: global.tname,
                    totalp: global.totalp
                };
                var loop = function () {
                    page++;
                    if (page > global.totalp) {
                        return resolve();
                    }
                    post.page = page;
                    self.http.append_header = {
                        'X-Requested-With': 'XMLHttpRequest'
                    };
                    return self.http.post(url, post, {message: "Get ajax fail"})
                        .then(function (page) {
                            var body = JSON.parse(page.body);
                            body = body.chap_list;
                            global.parse(body, false);
                            loop();
                        })
                        .catch(function (err) {
                            reject(err);
                        });
                };
                loop();
            })
        })
        .then(function () {
            // console.log(global.final);
            return {
                final: global.final,
                info: {
                    title: global.tname,
                    total: global.totalp
                }
            }
        });
};

api.get_chap_content = function (url) {
    var self = this;
    return self.q.when()
        .then(function () {
            return self.http.get(url, {}, {message: 'Get chap content fail'});
        })
        .then(function (page) {
            var $body = cheerio.load(page.body);
            var $chapter_content = $body('.chapter-content');
            if ($chapter_content.length <= 0) {
                throw new Error('Not found contend');
            }
            return $chapter_content.text();
        })
};


//----------------------------------------------------------------------------------------------------------------------
api.to_slug = function (str) {
    // Chuyển hết sang chữ thường
    str = str.toLowerCase();

    // xóa dấu
    str = str.replace(/(à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ)/g, 'a');
    str = str.replace(/(è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ)/g, 'e');
    str = str.replace(/(ì|í|ị|ỉ|ĩ)/g, 'i');
    str = str.replace(/(ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ)/g, 'o');
    str = str.replace(/(ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ)/g, 'u');
    str = str.replace(/(ỳ|ý|ỵ|ỷ|ỹ)/g, 'y');
    str = str.replace(/(đ)/g, 'd');

    // Xóa ký tự đặc biệt
    str = str.replace(/([^0-9a-z-\s])/g, '');

    // Xóa khoảng trắng thay bằng ký tự -
    str = str.replace(/(\s+)/g, '-');

    // xóa phần dự - ở đầu
    str = str.replace(/^-+/g, '');

    // xóa phần dư - ở cuối
    str = str.replace(/-+$/g, '');

    // return
    return str;
};
//----------------------------------------------------------------------------------------------------------------------
// api.get_get_paging = function (url) {
//     var self = this;
//     return self.q.when()
//         .then(function () {
//             return self.http.get(url, {}, {message: "Get paging fail"});
//         })
//         .then(function (page) {
//
//         })
// };

module.exports = _api;


// var a = new _api();
// a.host = 'http://truyenfull.vn';
// a.get_list_chap('http://truyenfull.vn/truyen-than-khong-thien-ha').done();
