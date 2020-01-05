const AppData = require('../app-data');

module.exports = async (req, res, next) => {
    if (req.user) {
        res.locals.user = req.user;

        const appData = new AppData(req);
    
        if (appData.numUrls === 0) {
            await (
                await appData.updateUrls()
            ).updateSession();
        }

        res.locals.app_data = appData.appData;
    }
    next();
};
