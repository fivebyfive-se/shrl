const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');

const expressSession = require('express-session');
const passport = require('./lib/passport');
const session = require('./lib/session');

const ensureHttps = require('./lib/middleware/ensure-https');
const userInViews = require('./lib/middleware/user-in-views');

const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const urlRouter = require('./routes/url');
const rootRouter = require('./routes/root');

const PORT = process.env.PORT || 80;

express()
    .use(ensureHttps)

    .use(expressSession(session))

    .use(passport.initialize())
    .use(passport.session())
    
    .use(userInViews)

    .use(bodyParser.json({ type: '*/json' }))
    .use(express.static(path.join(__dirname, 'public')))


    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'pug')

    .use('/auth', authRouter)
    .use('/user', userRouter)
    .use('/url', urlRouter)
    .use('/', rootRouter)

    .listen(PORT, () => console.log(`Listening on ${PORT}`))
;
