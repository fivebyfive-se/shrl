const express = require('express');

const parse = require('url-parse');

const redis = require('../lib/rediswrapper')('url_');
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

    .get('/:key', async (req, res) => {
        let url = null;
        try {
            url = await redis.get(req.params.key);
        } catch {
            url = null;
        }

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

            res.renderView('redirect', {
                success: true,
                hideNavigation: true,
                href,
                hostname,
                displayUrl,
                subtitle: `Redirecting to ${hostname}`
            });
        } else {
            res.renderView('redirect', {
                success: false,
                error: `${req.params.key} not found!`
            });
        }
    })

module.exports = router;
