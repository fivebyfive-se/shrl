const express = require('express');

const redis = require('../lib/rediswrapper');
const keyutil = require('../lib/util/key');

const validateKey = require('../lib/middleware/validate-key');
const renderViewData = require('../lib/middleware/render-view-data');

const router = express.Router();

router
    .use(renderViewData)

    .get('/', (req, res) => {
        const suggestion = keyutil.generate(process.env.KEY_DEFAULT_LENGTH || 5);
        res.renderView('index', { suggestion });
    })

    .get('404/:key?', (req, res) => {
        const key = req.params.key || null;
        res.renderView('notfound', { key, invalidKey: key && !keyutil.valid(key) })
    })

    .get('/:key', validateKey({errorStatus: 404, redirectTo: '/404'}), async (req, res) => {
        const url = await redis.get(req.params.key);
        const viewData = [];

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

            viewData.push({
                href,
                hostname,
                displayUrl,
                subtitle: `Redirecting to ${hostname}`
            });
        } else {
            viewData.push({
                success: false,
                error: `${req.params.key} not found!`
            })
        }
        res.renderView('redirect', ...viewData);
    })

module.exports = router;
