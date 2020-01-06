const AppData = require('../app-data');

module.exports = async (req, res, next) => {
    if (req.user) {
        res.locals.user = req.user;

        req.appData = new AppData(req);
    
        if (req.appData.numUrls === 0) {
            await req.appData.updateUrls();
        }

        res.locals.app_data = req.appData.appData;
    }
    next();
};
