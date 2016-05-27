var mSchema = {};
mSchema.mongoose = require('./dbMongo');
var q = require('q');
var util = require('util');
var Schema = mSchema.mongoose.Schema;
var ObjectId = Schema.Types.ObjectId;
var Mixed = Schema.Types.Mixed;

//--------------------------------------------------
mSchema.ObjectId = ObjectId;
mSchema.Mixed = Mixed;

// --------------------------------------------------
function BaseSchema() {
    Schema.apply(this, arguments);
    // this.add({
    //     created: {
    //         type: Number,
    //         default: 0
    //     },
    //     updated: {
    //         type: Number,
    //         default: 0
    //     },
    //     deleted: {
    //         type: Number,
    //         default: 0
    //     }
    // });

    this.statics.getBulk = function (isUnordered) {
        var self = this;
        return q.when()
            .then(function () {
                return q.nfcall(self.collection.findOne.bind(self.collection));
            })
            .then(function () {
                if (isUnordered) {
                    return self.collection.initializeUnorderedBulkOp();
                }
                return self.collection.initializeOrderedBulkOp();
            })
            .then(function (bulk) {
                var oldExecute = bulk.execute.bind(bulk);
                bulk.execute = function () {
                    return q.nfapply(oldExecute, arguments);
                };
                return bulk;
            })
    };
}

util.inherits(BaseSchema, Schema);
//-------------------collection name-------------------------------
mSchema.CollectionName = {
    config: 'config',
    data: 'data',
    data_detail: 'data_detail'
};

//-------------------define schema-------------------------------
mSchema.config = new BaseSchema({
    cf_name: {type: String, require: true, default: ''},
    cf_value: {type: Mixed, default: ''}
});
mSchema.config.index({cf_name: 1}, {unique: true});


mSchema.data = new BaseSchema({
    title: {type: String, require: true, default: ''},
    total: {type: Number, require: true, default: 0},
    ext: {type: Mixed}
});
mSchema.data.index({title: 1}, {unique: true});


mSchema.data_detail = new BaseSchema({
    data_id: {type: ObjectId, ref: mSchema.CollectionName.data},
    title: {type: String, require: true, default: ''},
    content: {type: String, default: '', require: true}
});
mSchema.data_detail.index({title: 1}, {unique: true});


/////////////////////////////////////////////
module.exports = mSchema;


