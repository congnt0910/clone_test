"use strict";


var Model = function () {
    var self = this;
    self.q = require('q');
    self.mongodb = require('../../database/dbModel');
};


var model = Model.prototype;

model.save_data = function (title, total) {
    var self = this;
    return self.q.when()
        .then(function () {
            var doc = {
                title: title,
                total: total
            };
            return self.mongodb.data.create(doc);
        })
        .then(function (doc) {
            if(!doc) {
                throw new Error("Create error");
            }
            return doc._id;
        });
};


model.save_data_detail = function (list_content, data_id) {
    var self = this;
    return self.q.when()
        .then(function () {
            // check data_id
            return self.mongodb.data.findOne({_id: data_id});
        })
        .then(function (doc) {
            if (!doc) {
                throw new Error('Not found data_id');
            }
            data_id = doc._id;
            return true;
        })
        .then(function () {
            return self.mongodb.data_detail.getBulk()
        })
        .then(function (bulk) {
            list_content.forEach(function (item) {
                bulk.insert({title: item.title, data_id: data_id, content: item.content})
            });
            return bulk.execute();
        })
};

module.exports = Model;