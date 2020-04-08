import { model, Schema } from 'mongoose';

const Event = new Schema({
    imei: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
}, {
    timestamps: true
});

export default model('event', Event);