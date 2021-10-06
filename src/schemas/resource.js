//https://mongoosejs.com/docs/schematypes.html
const Schema = require('mongoose').Schema;

const Resource = new Schema({
    path: {
        type: Schema.Types.String
    },
    name: {
        type: Schema.Types.String
    },
    descriptin: {
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
