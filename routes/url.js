const express = require('express');

const redis = require('../lib/rediswrapper');
const validateKey = require('../lib/middleware/validate-key');

const router = express.Router();

router
    .use(validateKey)

    .get('/:key', async (req, res) => {
        const found = await redis.exists(req.params.key);
        res.send({ found });
    })

    .post('/:key', async (req, res) => {
        const key = req.params.key;
        const url = req.body.url || null;
        const success = key && url ? (await redis.set(key, url)) : false;

        res.send({ key, url, success });
    })
;

module.exports = router;
