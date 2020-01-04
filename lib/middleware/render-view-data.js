const objHelper = require('../util/object');
const defaultVars = { 
    title: process.env.APP_NAME || 'shrl',
};

module.exports = (req, res, next) => {
    res.renderView = (...args) => {
        const [view, ...data] = args;
        const viewData = objHelper.merge(
            defaultVars,
            { url: (req.url || '').toString() },
            ...data
        );

        res.render(view, viewData);
    };
    next();
};