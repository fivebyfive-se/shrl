const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 80;

const app = express();
app
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'pug')
    .get('/', (_, res) => {
        res.render('index');
    })
    .get('/:key', (req, res) => {
        res.render('redirect', { key: req.params.key || '' });
    })
    .listen(PORT, () => {
        console.log(`Listening on ${PORT}`);
    });
