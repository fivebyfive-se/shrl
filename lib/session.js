module.exports = {
    secret: process.env.SESSION_SECRET || 'shirrley',
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: false
    },
    resave: false,
    saveUnitialized: true
};
