const passport = require('passport');
const express = require('express');

var util = require('util');
var url = require('url');
var querystring = require('querystring');

const router = express.Router();

console.log(__filename);

router
    .get('/login',
        passport.authenticate(
            'auth0',
            { scope: 'openid email profile' }
        ),
        (req, res) => res.redirect('/')
    )

    .get('/callback', (req, res, next) => {
        passport.authenticate('auth0', (err, user, info) => {
            if (err) {
                return next(err);
            } else if (!user) {
                return res.redirect('/auth/login');
            }
            req.logIn(user, (loginError) => {
                if (loginError) {
                    return next(loginError);
                }
                const returnTo = req.session.returnTo;
                delete req.session.returnTo;

                res.redirect(returnTo || '/');
            });
        })(req, res, next);
    })

    .get('/logout', (req, res) => {
        req.logout();
        let returnTo = req.protocol + '://' + req.hostname;

        const port = req.connection.localPort;
        if (port !== undefined && port !== 80 && port !== 443) {
          returnTo += ':' + port;
        }

        const logoutURL = new url.URL(
          util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN)
        );
        const searchString = querystring.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          returnTo: returnTo
        });
        logoutURL.search = searchString;
      
        res.redirect(logoutURL); 
    });

module.exports = router;
