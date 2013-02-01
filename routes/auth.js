var passport = require('passport');

exports.index = function (req, res, next) {
    "use strict";

    res.render('login', {
        config: req.app.config
    });
};

exports.login = function (req, res, next) {
    "use strict";

    var auth = passport.authenticate('openid');

    auth(req, res, next);
};

exports.openid_return = function (req, res, next) {
    "use strict";
    var auth = passport.authenticate('openid', {
        successRedirect: '/',
        failureRedirect: req.app.config.auth.openid.login.substr(1)
    });

    auth(req, res, next);
};

exports.logout = function (req, res, next) {
    "use strict";

    req.logout();
    res.redirect(req.app.config.auth.openid.login.substr(1));
};
