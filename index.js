const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const CachePugTemplates = require('cache-pug-templates');

const expressSession = require('express-session');
const passport = require('./server/lib/passport');
const session = require('./server/lib/session');

const ensureHttps = require('./server/lib/middleware/ensure-https');
const userInViews = require('./server/lib/middleware/user-in-views');

const authRouter = require('./server/routes/auth');
const userRouter = require('./server/routes/user');
const urlRouter = require('./server/routes/url');
const rootRouter = require('./server/routes/root');

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
    
    .use(userInViews)

    .use(bodyParser.json({ type: '*/json' }))
    .use(express.static(path.join(__dirname, 'public')))


    .set('views', views)
    .set('view engine', 'pug')

    .use('/auth', authRouter)
    .use('/user', userRouter)
    .use('/url', urlRouter)
    .use('/', rootRouter)

    .listen(PORT, () => {
        console.log(`Listening on ${PORT}`);
        const cache = new CachePugTemplates({ app, views });
        cache.start();
    })
;
