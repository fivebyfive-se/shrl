
const expressSession = require('express-session');
const Redis = require('ioredis');

let RedisStore = require('connect-redis')(expressSession);
let client = new Redis(process.env.REDIS_URL);

module.exports = {
    store: new RedisStore({ client }),
    secret: process.env.SESSION_SECRET || 'shirrley',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: false
    },
    resave: false,
    saveUnitialized: true
};
