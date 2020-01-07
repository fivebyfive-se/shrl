const express = require('express');

const AppData = require('../lib/app-data');
const redis = require('../lib/rediswrapper')('url_');
const validateKey = require('../lib/middleware/validate-key');

const router = express.Router();

const validate = validateKey({ returnData: { invalid: true } });

router
    .get('/:key', validate, async (req, res) => {
        const found = await redis.exists(req.params.key);
        res.type('application/json');
        res.send({ found });
    })

    .post('/:key', validate, async (req, res) => {
        const key = req.params.key;
        const url = req.body.url || null;
        const success = key && url ? (await redis.set(key, url)) : false;

        if (success && req.appData) {
            await req.appData.addUrl(key);
        }

        res.type('application/json');
        res.send({ key, url, success });
    })

    .delete('/:key', validate, async (req, res) => {
        const key = req.params.key;
        
        if (req.appData) {
            await req.appData.removeUrl(key);
            res.send({ key, success: true });
        } else {
            res.send({ success: false });
        }
    })
;

module.exports = router;
