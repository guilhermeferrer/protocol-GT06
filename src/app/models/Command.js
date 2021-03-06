import { model, Schema } from 'mongoose';

const Command = new Schema({
    _id: {
        type: String,
        required: true
    },
    imei: {
        type: String,
        required: true
    },
    command: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "sem resposta"
    },
},
    {
        timestamps: true
    }
);

export default model('command', Command);