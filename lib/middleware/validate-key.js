const keyutil = require('../util/key');
const objutil = require('../util/object');

const defaultOptions = {
    errorStatus: 400,
    redirectTo: null,
    returnData: null
};

module.exports = (options = {}) => (req, res, next) => {
    if (req.params && req.params.key && req.params.key && keyutil.valid(req.params.key)) {
        next();
    } else {
        const opts = objutil.merge(defaultOptions, options);
        if (opts.returnData) {
            res.type('application/json');
            res.send(opts.returnData);
        } else {
            res.sendStatus(opts.errorStatus);
            if (opts.redirectTo) {
                res.redirect(opts.redirectTo);
            }
        }
    }    
};
