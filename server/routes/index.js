const express = require('express');

const parse = require('url-parse');

const redis = require('../lib/rediswrapper')('url_');
const keyutil = require('../lib/util/key');

const renderViewData = require('../lib/middleware/render-view-data');
const injectPrismic = require('../lib/middleware/prismic-dom');


const authRouter = require('./auth');
const userRouter = require('./user');
const urlRouter = require('./url');

const cache = require('express-redis-cache')({
     client: redis.client,
     prefix: 'shrl',
     expire: 60 * 60 // 1 hour
});

cache.on('error', (e) => console.log(e));

const dontCacheUser =  function (req, res, next) {
    res.use_express_redis_cache = false; //!req.user;
 
    next();
};

const router = express.Router();

router
    .use('/auth', authRouter)
    .use('/user', userRouter)
    .use('/url', urlRouter)

    .use(renderViewData)

    .get('/', injectPrismic, dontCacheUser, cache.route(), async (req, res) => {
        const start = await req.prismicApi.getByUID('page', 'start', { lang: req.getLocale() === 'sv' ? 'sv-SE' : 'en-US' });
        const suggestion = keyutil.generate(process.env.KEY_DEFAULT_LENGTH || 5);
        res.renderView('index', { 
            page: start,
            suggestion,
            minKeyLength: 5 - (req.appData ? req.appData.userLevel : 0)
        });
    })

    .post('/cache/clear', async (req, res) => {
        const deleted = await Promise.resolve((resolve, reject) => {
            cache.del('*', (err, deleted) => {
                if (err) {
                    reject(err);
                }
                resolve(deleted);
            });
        });
        res.send({ deleted });
    })

    .get('/404/:key?', dontCacheUser, cache.route(), (req, res) => {
        const key = req.params.key || null;
        res.renderView('notfound', { key, invalidKey: key && !keyutil.valid(key) })
    })

    .get('/page/:page', injectPrismic, dontCacheUser, cache.route(), async (req, res) => {
        const page = await req.prismicApi.getByUID('page', req.params.page, { lang: req.getLocale() === 'sv' ? 'sv-SE' : 'en-US' });
        
        if (!page) {
            res.redirect('/404');
        } else {
            res.renderView('page', {
                view: `page:${req.params.page}`,
                subtitle: '',
                page
            });    
        }
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
