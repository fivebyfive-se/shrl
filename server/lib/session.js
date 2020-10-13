require('dotenv').config();
const expressSession = require('express-session');
const Redis = require('ioredis');

let RedisStore = require('connect-redis')(expressSession);
let client = new Redis(process.env.REDIS_URL, { connectTimeout: 30000 });

session.on('error', (...args) => console.log(args));

module.exports = {
    store: process.env.NODE_ENV === 'production' ? new RedisStore({ client }) : null,
    secret: process.env.SESSION_SECRET || 'shirrley',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: false
    },
    resave: false,
    saveUnitialized: true
};
