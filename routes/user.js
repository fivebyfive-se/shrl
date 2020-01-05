const express = require('express');
const secured = require('../lib/middleware/secured');
const renderViewData = require('../lib/middleware/render-view-data');

const router = express.Router();

router
    .use(secured)
    .use(renderViewData)

    .get('/', (req, res) => {
        const { _raw, _json, ...userProfile } = req.user;
        res.renderView('user', { userProfile });
    })

    .get('/urls', (req, res) => {

    })

module.exports = router;
