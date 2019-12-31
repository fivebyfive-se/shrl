const Redis = require('ioredis');
const URL_PREFIX = process.env.URL_KEY_PREFIX || 'url_';

const _sanitizeKey = (key) => (key || '').replace(/[^0-9a-z]\-\._~/gi, '');
const _prefixKey  = (key) => URL_PREFIX + _sanitizeKey(key || '');
const _isKeyEmpty = (key) => (key || URL_PREFIX) === URL_PREFIX;

const redis = new Redis(process.env.REDIS_URL);
    
const safeExists = async (key) => {
    const realKey = _prefixKey(key);
    if (_isKeyEmpty(realKey)) {
        return false;
    }
    try {
        const exists = await redis.exists(realKey);
        return !!exists;
    } catch {
        return false;
    }
};

const safeGet = async (key) => {
    const realKey = _prefixKey(key);
    if (realKey === URL_PREFIX) {
        return Promise.reject(null);
    }
    try {
        const value = await redis.get(realKey);
        return value || null;
    } catch {
        return Promise.reject(null);
    }
};

const safeSet = async (key, value) => {
    if (await safeExists(key)) {
        return Promise.reject(null);
    }
    const realKey = _prefixKey(key);

    try {
        const res = await redis.set(realKey, value);
        return !!res;
    } catch {
        return Promise.reject(null);
    }
};

module.exports = {
    exists: safeExists,
    get: safeGet,
    set: safeSet
};