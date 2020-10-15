const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

// const CachePugTemplates = require('cache-pug-templates');

const expressSession = require('express-session');
const passport = require('./server/lib/passport');
const session = require('./server/lib/session');

const ensureHttps = require('./server/lib/middleware/ensure-https');
const userInViews = require('./server/lib/middleware/user-in-views');

const router = require('./server/routes');

const i18n = require('i18n');

i18n.configure({
    locales: ['en', 'sv'],
    directory: path.join(__dirname, 'locales'),
    objectNotation: true
});

const PORT = process.env.PORT || 80;

const app = express();
const views = path.join(__dirname, 'server', 'views');
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // trust first proxy
}

app
    .use(ensureHttps)

    .use(expressSession(session))

    .use(passport.initialize())
    .use(passport.session())
    
    .use(i18n.init)

    .use(userInViews)

    .use(bodyParser.json({ type: '*/json' }))
    .use(express.static(path.join(__dirname, 'public')))


    .set('views', views)
    .set('view engine', 'pug')

    .use('/', router)

    .listen(PORT, () => {
        console.log(`Listening on ${PORT}`);
    })
;
