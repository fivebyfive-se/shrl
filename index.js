const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const parse = require('url-parse');
const randomString = require('crypto-random-string');
const redis = require('./src/rediswrapper');

const PORT = process.env.PORT || 80;
const APP_NAME = process.env.APP_NAME || 'shrl';

const defaultVars = { title: APP_NAME };

express()
    .use(bodyParser.json({type: '*/json'}))
    .use(express.static(path.join(__dirname, 'public')))
    .use((req, res, next) => {
        if (process.env.NODE_ENV === 'production' && req.headers['x-forwarded-proto'] !== 'https'){
            console.log( 'forceSSL req.get = ' + req.get('Host') + ' req.url = ' + req.url );
            return res.redirect('https://' + req.get('Host') + req.url );
        }
        next();
    })

    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'pug')

    .get('/', (req, res) => {
        const suggestion = randomString({length: 6, type: 'url-safe'});
        res.render('index', { ...defaultVars, suggestion });
    })

    .get('/url/:key', async (req, res) => {
        const found = await redis.exists(req.params.key);
        res.send({ found });
    })
    .post('/url/:key', async (req, res) => {
        const key = req.params.key;
        const url = req.body.url || null;
        const success = key && url ? (await redis.set(key, url)) : false;

        res.send({ key, url, success });
    })

    .get('/:key', async (req, res) => {
        const url = await redis.get(req.params.key);
        if (url) {
            const parsedUrl = parse(url);
            const { href, hostname } = { ...parsedUrl }; 
            const displayUrl = Object.keys(parsedUrl).reduce((prev, part) => {
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
            res.render('redirect', { ...defaultVars, success: false, error: `${req.params.key} not found!` })
        }
    })

    .listen(PORT, () => {
        console.log(`Listening on ${PORT}`);
    });
