//https://mongoosejs.com/docs/schematypes.html
const Schema = require('mongoose').Schema;

const Role = new Schema({
    name: {
        type: Schema.Types.String
    },
    descriptin: {
        type: Schema.Types.String
    },
    resources: [Schema.Types.String],
    archived: {
        type: Schema.Types.Boolean,
        default: false
    }
}, {
    timestamps: {}
});

module.exports = Role;
