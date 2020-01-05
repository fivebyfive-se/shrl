const passport = require('passport');
const express = require('express');
const util = require('util');
const url = require('url');
const querystring = require('querystring');

const router = express.Router();

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
        const returnTo = `${req.protocol}://${req.hostname}`;
        const logoutURL = new url.URL(util.format('https://%s/v2/logout', process.env.AUTH0_DOMAIN));
        logoutURL.search = querystring.stringify({
          client_id: process.env.AUTH0_CLIENT_ID,
          returnTo
        });
      
        res.redirect(logoutURL); 
    });

module.exports = router;
