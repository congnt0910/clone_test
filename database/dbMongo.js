"use strict";

var mongoose = require('mongoose').set('debug', false);
var mongoConfig = require('./config').mongoConfig;
var uri = 'mongodb://' + mongoConfig.host + '/' + mongoConfig.database;
mongoose.connect(uri, mongoConfig.options);
mongoose.Promise = require('q').Promise;

module.exports = mongoose;