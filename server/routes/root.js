const express = require('express');

const parse = require('url-parse');

const Redis = require('ioredis');

const redis = require('../lib/rediswrapper')('url_');
const keyutil = require('../lib/util/key');

const validateKey = require('../lib/middleware/validate-key');
const renderViewData = require('../lib/middleware/render-view-data');
const injectPrismic = require('../lib/middleware/prismic-dom');

const cacheClient = new Redis(process.env.REDIS_URL, { connectTimeout: 30000 });
cacheClient.on('error', (...args) => console.log(args));
const cache = require('express-redis-cache')({
     client: cacheClient,
     prefix: 'shrl'
});

const dontCacheUser =  function (req, res, next) {
    res.use_express_redis_cache = !req.user;
 
    next();
};

const router = express.Router();

router
    .use(renderViewData)

    .get('/', dontCacheUser, cache.route({ expire: 15000 }), (req, res) => {
        const suggestion = keyutil.generate(process.env.KEY_DEFAULT_LENGTH || 5);
        res.renderView('index', { 
            suggestion,
            minKeyLength: 5 - (req.appData ? req.appData.userLevel : 0)
        });
    })

    .get('/404/:key?', dontCacheUser, cache.route(), (req, res) => {
        const key = req.params.key || null;
        res.renderView('notfound', { key, invalidKey: key && !keyutil.valid(key) })
    })

    .get('/page/:page', dontCacheUser, cache.route(), injectPrismic, async (req, res) => {
        const page = await req.prismicApi.getByUID('page', req.params.page, {});
        res.renderView('page', {
            view: `page:${req.params.page}`,
            subtitle: '',
            page
        });
    })

    .get('/:key', cache.route(), async (req, res) => {
        let url = null,
            delay = 15;
        try {
            url = await redis.get(req.params.key);
            if (await redis.exists(`${req.params.key}_userLevel`)) {
                const userLevel = (await redis.get(`${req.params.key}_userLevel`)) || 0;
                if (userLevel <= 0) {
                    delay = 15;
                } else if (userLevel <= 1) {
                    delay = 3;
                } else {
                    delay = 0;
                }
            }
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
                delay: req.appData && req.appData.userLevel > 0 ? 5 : 15,
                href,
                hostname,
                displayUrl,
                delay,
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
