//https://mongoosejs.com/docs/schematypes.html
const Schema = require('mongoose').Schema;

const Todo = new Schema({
    name: {
        type: Schema.Types.String
    },
    archived: {
        type: Schema.Types.Boolean,
        default: false
    }
}, {
    timestamps: {}
});

module.exports = Todo;
