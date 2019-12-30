const express = require('express');
const path = require('path');

const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

const PORT = process.env.PORT || 80;

const prefixKey = (key) => {
    return 'url_' + (key || '').replace(/\W+/gi, '');
};
const safeGet = (key, fallback = null) => {
    const realKey = prefixKey(key);
    return redis.get(realKey)
        .then((res) => res || fallback)
        .catch(() => fallback);
};
const safeSet = (key, value) => {
    return safeGet(key, null)
        .then((res) => {
            if (!res) {
                return redis.set(prefixKey(key), value);
            } else {
                return Promise.resolve(res);
            }
        });
};

express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'pug')
    .get('/', (_, res) => {
        res.render('index');
    })
    .get('/url/:key', (req, res) => {
        safeGet(req.params.key)
            .then((value) => res.send({ key, value }));
    })
    .post('/url/:key/:url', (req, res) => {
        safeSet(req.params.key, req.params.url)
            .then((value) => {
                res.send({ key: req.params.key, value })
            });
    })
    .get('/:key', (req, res) => {
        redis.get(req.params.key)
            .then((result) => {
                res.render('redirect', { url: result });
            })
            .catch(() => res.status(400));
    })
    .listen(PORT, () => {
        console.log(`Listening on ${PORT}`);
    });
