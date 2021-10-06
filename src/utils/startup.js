import mongoose from 'mongoose';

function startAll() {
    // eslint-disable-next-line no-extend-native
    String.prototype.toObjectId = function () {
        // eslint-disable-next-line hapi/hapi-no-var
        var ObjectId = mongoose.Types.ObjectId;
        return new ObjectId(this.toString());
    };
}

export default {
    startAll
};
