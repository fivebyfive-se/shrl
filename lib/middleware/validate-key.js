const key = require('../key');

module.exports = (req, res, next) => {
    if (req.params && req.params.key && req.params.key && key.valid(req.params.key)) {
        next(req, res);
    } else {
        res.sendStatus(400);
    }    
};
