import { model, Schema } from 'mongoose';

const EventConfig = new Schema({
    entity: {
        type: String,
        unique: true
    },
    organization: {
        type: String,
    },
    events_config: {
        type: JSON,
        default: {}
    }
},
    {
        timestamps: true
    }
);

export default model('event-config', EventConfig);