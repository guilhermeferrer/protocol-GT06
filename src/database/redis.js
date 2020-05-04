import Redis from 'ioredis';

const { HOST, REDIS_PORT, REDIS_DATABASE, REDIS_PASSWD } = process.env;

export default new Redis({
    port: REDIS_PORT,
    db: REDIS_DATABASE,
    host: HOST,
    password: REDIS_PASSWD
});