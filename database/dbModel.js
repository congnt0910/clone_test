"use strict";

var dbSchema = require('./dbSchema');
var mongoose = dbSchema.mongoose;

var dbModel = {};

dbModel.dbSchema = dbSchema;
dbModel.Types = mongoose.Types;


dbModel.data = mongoose.model(dbSchema.CollectionName.data, dbSchema.data, dbSchema.CollectionName.data);
dbModel.data_detail = mongoose.model(dbSchema.CollectionName.data_detail, dbSchema.data_detail, dbSchema.CollectionName.data_detail);



module.exports = dbModel;
