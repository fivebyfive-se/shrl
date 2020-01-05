const crs = require('crypto-random-string');
const validCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789-_.';
const validCharsRex = 'a-z0-9\\-_\\.';

const minChars = 3;
const maxChars = 255;

const sanitizeRex = new RegExp(`[^${validCharsRex}]`, 'gi');
const validateRex = new RegExp(`^[${validCharsRex}]{${minChars},${maxChars}}$`);

const reserved = [
    'auth',
    'url',
    'user',
    '404'
];

const generate = (length = 5) => crs({ length, characters: validCharacters });
const sanitize = (key = '') => (key || '').replace(/[^a-z0-9\-_\.]/gi, '');
const valid = (key = '') => !reserved.includes(key) && /^[a-z0-9\-_\.]{3,}$/i.test(key);

module.exports = {
    generate,
    sanitize,
    valid
};
