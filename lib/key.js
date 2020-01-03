const crs = require('crypto-random-string');
const validCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789-_';

const reserved = [
    'auth',
    'url',
    'user'
];

const generate = (length = 5) => crs({ length, characters: validCharacters });
const sanitize = (key = '') => (key || '').replace(/[^a-z0-9\-_]/gi, '');
const valid = (key = '') => /^[a-z0-9\-_]{3,}$/i.test(key);

module.exports = {
    generate,
    sanitize,
    valid
};
