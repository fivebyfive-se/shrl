const arrayUtil = require('./util/array');
const redisWrapper = require('./rediswrapper');
const crypto = require('crypto');

const sha512 = (...items) => {
    const hash = crypto.createHash('sha512');

    items.forEach((i) => hash.update(i));

    return hash.digest('base64');
};

const SECRET_KEY = process.env.APP_DATA_KEY || 'shirrley';
const generateToken = (userId) => sha512(userId, SECRET_KEY);
const generateKey = (userId, ...subKeys) => [sha512(userId), ...subKeys].join('_');

const tokenRedis = redisWrapper('token_');
const userRedis = redisWrapper('user_');
const urlRedis = redisWrapper('url_');

const sanitizeAppData = (appData) => {
    return {
        token: null,
        urls: {},
        level: 0,
        ...appData
    }
};

class AppData {
    constructor(request) {
        const self = this;

        // #region Private members
        let _session,
            _isLoggedIn,
            _userId,
            _userToken,
            _userUrlKey,
            _appData
        ;

        const initAppData = (userId, session) => {
            _session = session || {},
            _isLoggedIn = !!(userId),
            _userId = _isLoggedIn ? userId : null,
            _userToken = _isLoggedIn ? generateToken(_userId) : null,
            _userUrlKey = _isLoggedIn ? generateKey(_userId, 'url') : null,
            _appData = sanitizeAppData(
                _isLoggedIn && _session.app_data && _session.app_data.token && _session.app_data.urls && _session.app_data.token === _userToken 
                    ? { level: 1, ..._session.app_data }
                    : { level: 1, token: _userToken, urls: {} }
            )
        };

        this.getIsLoggedIn = () => _isLoggedIn;
        this.getAppData = () => (_isLoggedIn ? { ..._appData } : null);
        this.getUrls = () => _isLoggedIn ? _appData.urls : {}; 
        this.getToken = ()  => _isLoggedIn ? _appData.token : null;

        initAppData(request.user ? request.user.id : null, request.session);
        // #endregion

        this.parseToken = async (token) => {
            const userIdKey = generateKey(token, 'userid');
            const userId = await tokenRedis.get(userIdKey);
            if (userId) {
                initAppData(userId, {});
            }
            return self;
        };

        this.saveToken = async () => {
            if (_isLoggedIn) {
                const userIdKey = generateKey(_userToken, 'userid');
                await tokenRedis.set(userIdKey, _userId);
            }
            return self;
        };
        
        this.addUrl = async (...urlKeys) => {
            if (_isLoggedIn) {
                await userRedis.lpush(_userUrlKey, ...urlKeys);
                await self.updateUrls();
                await self.updateSession();
            }
            return self;
        };

        this.removeUrl = async (urlKey) => {
            if (_isLoggedIn) {
                await urlRedis.del(urlKey);
                await userRedis.lrem(_userUrlKey, urlKey);
                await self.updateUrls();
                await self.updateSession();
            }
        };

        this.updateUrls = async (numUrls = 255) => {
            if (_isLoggedIn) {
                const keys = await userRedis.lrange(_userUrlKey, numUrls);
                const vals = await urlRedis.mget(...keys);
    
                _appData = {
                    ..._appData,
                    urls: arrayUtil.toObject(keys, vals)
                };
                await self.updateSession();
            }
            return self;
        };
        
        this.updateSession = async () => {
            if (_isLoggedIn) {
                request.session.app_data = { ..._appData };
            }
            return self;
        };
    }

    get appData() { return this.getAppData(); }
    get isLoggedIn() { return this.getIsLoggedIn(); }
    get token() { return this.getToken(); }
    get urls() { return this.getUrls(); }
    get numUrls() { return Object.keys(this.urls || {}).length; }
}

module.exports = AppData;
