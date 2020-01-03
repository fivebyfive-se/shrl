const express = require('express');
const secured = require('../lib/middleware/secured');
const router = express.Router();

console.log(__filename);

router
    .use(secured)
    .get('/', (req, res) => {
        const { _raw, _json, ...userProfile } = req.user;
        res.render('user', { title: '', userProfile });
    })

module.exports = router;
