const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const wrapper = (prefix = null) => {
    const keyPrefix = prefix || '';

    const _sanitizeKey = (key) => (key || '').replace(/[^0-9a-z]\-_\./gi, '');
    const _prefixKey  = (key) => keyPrefix + _sanitizeKey(key || '');
    const _isKeyEmpty = (key) => (key || '').length < 1 || key === keyPrefix;
        
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
    
    const safeGet = async (key, fallback = null) => {
        const realKey = _prefixKey(key);
        if (_isKeyEmpty(realKey)) {
            return Promise.reject(null);
        }
        try {
            const value = await redis.get(realKey);
            return value || fallback;
        } catch {
            return Promise.reject(fallback);
        }
    };
    
    const safeSet = async (key, value) => {
        if (await safeExists(key)) {
            return Promise.reject(null);
        }
        const realKey = _prefixKey(key);
    
        try {
            return !!(await redis.set(realKey, value));
        } catch {
            return Promise.reject(null);
        }
    };
    
    const safeHExists = async (hash, key = null) => {
        if (!key) {
            return await safeExists(hash);
        }
        try {
            const realHash = _prefixKey(hash);
            return !!(await redis.hexists(realHash, key));
        } catch {
            return Promise.reject(null);
        }
    };
    
    const safeHGet = async (hash, key = null, fallback = null) => {
        const realHash = _prefixKey(hash);
        try {
            if (!key) {
                return (await redis.hgetall(realHash)) || fallback;
            }  else {
                return (await redis.hget(hash, key)) || fallback;
            }
        } catch {
            return fallback;
        }
    };

    const safeHSet = async (hash, key, value, ...args) => {
        const realHash = _prefixKey(hash);
        let res = false;
        try {
            res = !!(await redis.hset(realHash, key, value));
        } catch {
            res = false;
        } finally {
            if (args.length >= 2) {
                res = res && (await safeHSet(hash, ...args));
            }
            return res;
        }
    };

    const safeLLen = async (key) => {
        const realKey = _prefixKey(key);
        try {
            return (await redis.llen(realKey));
        } catch {
            return 0;
        }
    };

    const safeLPush = async (key, ...values) => {
        const realKey = _prefixKey(key);
        try {
            return (await redis.lpush(realKey, ...values));
        } catch {
            return 0;
        }
    };

    const safeLRange = async (key, numValues = 5, startIndex = 0) => {
        const realKey = _prefixKey(key);
        try {
            return (await redis.lrange(realKey, startIndex, (numValues + startIndex) - 1));
        } catch {
            return [];
        }
    };

    const safeMGet = async (...keys) => {
        if (keys.length === 0) {
            return [];
        }
        const realKeys = keys.map(_prefixKey);
        try {
            return (await redis.mget(...realKeys)) || [];
        } catch {
            return [];
        }
    };
    
    return {
        exists: safeExists,
        get: safeGet,
        set: safeSet,

        hexists: safeHExists,
        hget: safeHGet,
        hset: safeHSet,

        llen: safeLLen,
        lpush: safeLPush,
        lrange: safeLRange,

        mget: safeMGet
    };
};

module.exports = wrapper;
