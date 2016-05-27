"use strict";

// test

var Test = function () {
    var self = this;
    self.q = require('q');
    self.api = new (require('./api/tfull/api'))();

    self.model = new (require('./model/save/model'))();


};
var test = Test.prototype;

test.run = function () {
    var self = this;
    var global = {};
    var url = 'http://truyenfull.vn/truyen-than-khong-thien-ha';
    return self.q.when()
        .then(function () {
            return self.api.get_list_chap(url)
                .then(function (data) {
                    return self.model.save_data(data.info.title, data.info.total)
                        .then(function (data_id) {
                            // get content
                            global.data_id = data_id;

                            return self.get_all_content(data.final);
                        });
                })
                .then(function (data) {
                    return self.model.save_data_detail(data, global.data_id);
                });
        })
        .catch(function (err) {
            console.log(err.stack);
        })
};

test.get_all_content = function (list) {
    var self = this;
    return self.q.Promise(function (resolve, reject) {
        var rs = [];
        var loop = function () {
            if (list.length == 0) {
                return resolve(rs)
            }
            var item = list.shift();
            self.api.get_chap_content(item.url)
                .then(function (content) {
                    rs.push({
                        title: item.title,
                        content: content
                    });
                    loop();
                })
                .catch(function (err) {
                    return reject(err);
                })
        };
        loop();
    })
};


module.exports = new Test();
module.exports.run();

