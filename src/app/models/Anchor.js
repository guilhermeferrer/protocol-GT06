import { model, Schema } from 'mongoose';

const Anchor = new Schema({
    point: {
        type: JSON,
        required: true
    },
    imei: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

export default model('anchor', Anchor);