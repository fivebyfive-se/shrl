const express = require('express');

const redis = require('../lib/rediswrapper');
const validateKey = require('../lib/middleware/validate-key');

const router = express.Router();

const validate = validateKey({ returnData: { invalid: true }});

router
    .get('/:key', validate, async (req, res) => {
        const found = await redis.exists(req.params.key);
        console.log(found);
        res.type('application/json');
        res.send({ found });
    })

    .post('/:key', validate, async (req, res) => {
        const key = req.params.key;
        const url = req.body.url || null;
        const success = key && url ? (await redis.set(key, url)) : false;

        res.type('application/json');
        res.send({ key, url, success });
    })
;

module.exports = router;
