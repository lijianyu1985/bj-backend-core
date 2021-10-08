//https://mongoosejs.com/docs/schematypes.html
const Schema = require('mongoose').Schema;

const Resource = new Schema({
    path: {
        type: Schema.Types.String
    },
    name: {
        type: Schema.Types.String
    },
    type: {//api,admin,web,mobile,xiaochengxu,app
        type: Schema.Types.String
    },
    data: {
        type: Schema.Types.String
    },
    description: {
        type: Schema.Types.String
    },
    archived: {
        type: Schema.Types.Boolean,
        default: false
    }
}, {
    timestamps: {}
});

module.exports = Resource;
