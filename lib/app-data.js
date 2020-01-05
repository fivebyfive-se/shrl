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

const userRedis = redisWrapper('user_');
const urlRedis = redisWrapper('url_');

class AppData {
    constructor(request) {
        const self = this;

        // #region Private members
        let _session = request.session || {},
            _isLoggedIn = !!(request.user),
            _userId = _isLoggedIn ? request.user.id : null,
            _userToken = _isLoggedIn ? generateToken(_userId) : null,
            _userUrlKey = _isLoggedIn ? generateKey(_userId, 'url') : null,
            _appData = !_isLoggedIn ? null
                :  _session.app_data && _session.app_data.token && _session.app_data.urls && _session.app_data.token === _userToken 
                    ? { ..._session.app_data }
                    : { token: _userToken, urls: {} }
        ;
        // #endregion

        this.getIsLoggedIn = () => _isLoggedIn;
        this.getAppData = () => (_isLoggedIn ? { ..._appData } : null);
        this.getUrls = () => _isLoggedIn ? _appData.urls : {}; 
        this.getToken = ()  => _isLoggedIn ? _appData.token : null;
        
        this.addUrl = async (...urlKeys) => {
            if (_isLoggedIn) {
                await userRedis.lpush(_userUrlKey, ...urlKeys);
                await self.updateUrls();
                await self.updateSession();
            }
            return self;
        };

        this.updateUrls = async (numUrls = 16) => {
            if (_isLoggedIn) {
                const keys = await userRedis.lrange(_userUrlKey, numUrls);
                const vals = await urlRedis.mget(...keys);
    
                _appData = {
                    ..._appData,
                    urls: arrayUtil.toObject(keys, vals)
                };
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
