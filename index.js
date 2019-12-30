const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const parse = require('url-parse');
const Redis = require('ioredis');
const randomString = require('crypto-random-string');

const redis = new Redis(process.env.REDIS_URL);

const PORT = process.env.PORT || 80;
const URL_PREFIX = process.env.URL_KEY_PREFIX || 'url_';

const prefixKey = (key) => {
    return URL_PREFIX + (key || '').replace(/\W+/gi, '');
};
const safeExists = async (key) => {
    const realKey = prefixKey(key);
    if (realKey === URL_PREFIX) {
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
    const realKey = prefixKey(key);
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
    const keyExists = await safeExists(key);

    if (!keyExists) {
        const realKey = prefixKey(key);
        try {
            const res = await redis.set(realKey, value);
            return !!res;
        } catch (e) {
            return Promise.reject(null);
        }
    }
    return Promise.reject(null);
};

express()
    .use(bodyParser.json({type: '*/json'}))
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'pug')
    .get('/', (_, res) => {
        const suggestion = randomString({length: 6, type: 'url-safe'});
        res.render('index', { suggestion });
    })
    .get('/url/:key', (req, res) => {
        safeExists(req.params.key)
            .then((found) => res.send({ found }))
            .catch(() => res.status(400));
    })
    .post('/url/:key', (req, res) => {
        const url = req.body.url || null;
        safeSet(req.params.key, url)
            .then(
                (success) => res.send({ key: req.params.key, url, success }),
                () => res.status(400)
            ).catch(() => res.status(400));
    })
    .get('/:key', (req, res) => {
        safeGet(req.params.key)
            .then(
                (url) => {
                    const parsedUrl = parse(url);
                    console.log(parsedUrl);
                    let displayUrl = url;
                    Object.keys(parsedUrl).forEach((k) => {
                        const val = parsedUrl[k] || '';
                        if (val.length > 1) {
                            displayUrl = displayUrl.replace(val, `<span class="url__part--${k}">${val}</span>`)
                        }
                    });
                    res.render('redirect', { url: parsedUrl.href, hostname: parsedUrl.hostname, displayUrl } );
                },
                () => res.status(400)
            ).catch(() => res.status(400));
    })
    .listen(PORT, () => {
        console.log(`Listening on ${PORT}`);
    });
