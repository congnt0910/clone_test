"use strict";
process.env.DEBUG = 'httpRequest';

var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var _ = require('underscore');
var _httpRequest = require('../../lib/httpRequest');

var http = new _httpRequest();


//######################################################################################################################
var page = {};
page.body = fs.readFileSync('711_.htm', 'utf8');
var $ = cheerio.load('');

var $body = cheerio.load(page.body);

//-------------------------------------
var $chapter_content = $body('.chapter-content').text();
console.log($chapter_content);
return

//######################################################################################################################

var page = {};
page.body = fs.readFileSync('15_.htm', 'utf8');

var $ = cheerio.load('');

var $body = cheerio.load(page.body);

//-------------------------------------
var $desc = $body('.desc');
var title = $desc.find('h3.title').text().trim();
console.log(title);
//-------------------------------------
var $list_chap = $body('#list-chapter');
if ($list_chap.length == 0) {
    throw new Error('Not found list chapter');
}
var $class_list_chapter = $list_chap.find('.list-chapter');
var final = [];
$class_list_chapter.get().forEach(function (ul) {
    var $lis = $(ul).find('>li');
    $lis.get().forEach(function (li) {
        var $li = $(li);
        final.push({
            url: $li.find('a').attr('href'),
            title: $li.text().replace(/Chương/i, '').trim()
        });
    })
});
// console.log(final);
//-------------------------------------
var truyen_id = $body('#truyen-id').attr('value');
var total = $body('#total-page').attr('value');

console.log(truyen_id, total);
//-------------------------------------


var to_slug = function (str) {
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
var url = 'http://truyenfull.vn/ajax.php';
var tname = 'Thần Khống Thiên Hạ';
var post = {
    type: 'list_chapter',
    tid: 389,
    tascii: to_slug(tname),
    tname: tname,
    totalp: 54
};
post.page = 39;
// http.jsonPost = true;
http.append_header = {
    'X-Requested-With': 'XMLHttpRequest'
};
http.charles = true;
return http.post(url, post, {message: "Get ajax fail"})
    .then(function (page) {
        var body = JSON.parse(page.body);
        console.log(body.chap_list);
    })
    .catch(function (err) {
        console.log(err.stack);
    });





