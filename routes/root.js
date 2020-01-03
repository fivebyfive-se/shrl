const express = require('express');
const redis = require('../lib/rediswrapper');
const keyutil = require('../lib/key');
const validateKey = require('../lib/middleware/validate-key');
const router = express.Router();

const APP_NAME = process.env.APP_NAME || 'shrl';
const defaultVars = { title: APP_NAME };

console.log(__filename);

router
    .get('/', (req, res) => {
        const suggestion = keyutil.generate(process.env.KEY_DEFAULT_LENGTH || 5);
        res.render('index', { ...defaultVars, suggestion });
    })

    .get('/:key', validateKey, async (req, res) => {
        const url = await redis.get(req.params.key);
        if (url) {
            const parsedUrl = parse(url);
            const { href, hostname } = { ...parsedUrl };
            const displayUrl = Object.keys(parsedUrl)
                .reduce((prev, part) => {
                    const val = parsedUrl[part];
                    return (val && val.length > 1)
                        ? prev.replace(val, `<span class="url__part--${part}">${val}</span>`)
                        : prev;
                }, parsedUrl.toString());

            res.render('redirect', {
                ...defaultVars,
                success: true,
                href,
                hostname,
                displayUrl,
                subtitle: `Redirecting to ${hostname}`
            });
        } else {
            res.render('redirect', {
                ...defaultVars,
                success: false,
                error: `${req.params.key} not found!`
            })
        }
    })

module.exports = router;
