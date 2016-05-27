"use strict";

// test

var Test = function () {
    var self = this;
    self.q = require('q');
    self.api = new (require('../clone/api/tfull/api'))();

    self.model = new (require('./model/save/model'))();




};
var test = Test.prototype;

test.run = function () {
    var self = this;
    var global = {};
    var url = '';
    return self.q.when()
        .then(function () {
            return self.api.get_list_chap(url)
                .then(function (data) {
                    return self.model.save_data(data.info.title, data.info.total)
                        .then(function (data_id) {
                            // get content
                            global.data_id = data_id;

                        });
                })
                .then(function () {
                    return self.model.save_data_detail(data.final, data_id);
                });
        })
};

test.get_all_content = function () {
    var self = this;
    return self.q.Promise(function (resolve, reject) {

    })
};


module.exports = Test;
