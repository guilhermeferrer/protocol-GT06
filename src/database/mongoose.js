import mongoose from 'mongoose';

const connection = mongoose.connect('mongodb://localhost:27017/gateway', {
    useCreateIndex: true, useNewUrlParser: true, useUnifiedTopology: true
});

export default connection;