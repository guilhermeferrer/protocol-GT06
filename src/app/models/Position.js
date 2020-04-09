import { model, Schema } from 'mongoose';

const Position = new Schema({
    latitude: {
        type: String,
        required: true
    },
    longitude: {
        type: String,
        required: true
    },
    velocity: {
        type: Number,
        required: true
    },
    gps_date: {
        type: Date,
        required: true
    },
    imei: {
        type: String,
        required: true
    },
    ignition: {
        type: Boolean,
        required: true
    },
    electricity: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true
});

export default (imei) => model(`position_${imei}`, Position);