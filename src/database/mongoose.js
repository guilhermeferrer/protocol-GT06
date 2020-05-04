import mongoose from 'mongoose';
const { HOST, MONGODB_PORT, MONGODB_DATABASE, MONGODB_USER, MONGODB_PASSWD } = process.env;
const connection = mongoose.connect(`mongodb://${HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    auth: {
        user: MONGODB_USER,
        password: MONGODB_PASSWD
    }
});

export default connection;