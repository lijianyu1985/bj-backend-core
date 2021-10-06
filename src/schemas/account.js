//https://mongoosejs.com/docs/schematypes.html
const Schema = require('mongoose').Schema;

const Account = new Schema({
    username: {
        type: Schema.Types.String
    },
    roles: [Schema.Types.String],
    password: {
        type: Schema.Types.String
    },
    name: {
        type: Schema.Types.String
    },
    fingerPrint: {
        type: Schema.Types.Number,
        default: 0
    },
    archived: {
        type: Schema.Types.Boolean,
        default: false
    }
}, {
    timestamps: {}
});

module.exports = Account;
