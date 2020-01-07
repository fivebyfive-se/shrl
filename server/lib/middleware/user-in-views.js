const AppData = require('../app-data');

module.exports = async (req, res, next) => {
    if (req.user) {
        res.locals.user = req.user;
        req.appData = await AppData.fromRequest(req);
    } else {
        const token = req.body && req.body.token 
            ? req.body.token
            : req.query && req.query.token 
                ? req.query.token
                : null;

        req.appData = token ? await AppData.fromToken(token) : null;
    }

    if (req.appData) {
        if (req.appData.numUrls === 0) {
            await req.appData.updateUrls();
            await req.appData.saveSession(req);
        }

        res.locals.app_data = {
            ...req.appData.appData,
            urlPreview: req.appData.getUrlList(5)
        };
    }
    next();
};
