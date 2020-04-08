import { model, Schema } from 'mongoose';

const LastPosition = new Schema({
    imei: {
        type: String,
        unique: true,
        required: true
    },
    entity: {
        type: String,
    },
    organization: {
        type: String,
    },
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
    ignition: {
        type: Boolean,
        required: true
    },
    electricity: {
        type: Boolean,
        required: true
    },
    anchor: {
        type: Boolean,
        required: true
    },
    events_config: {
        type: JSON,
        default: {}
    }
}, {
    timestamps: true
})

export default model('last-position', LastPosition);