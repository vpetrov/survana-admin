/** lib/auth.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var passport = require('passport');
var OpenIDStrategy = require('passport-openid').Strategy;
var async = require('async');
var urlutil = require('./urlutil');
var blacklist = require('./blacklist');

exports.checkuser = function (app, user, next) {
    "use strict";

    var db = app.db;

    if (!db) {
        return next(new Error('Database not available.'));
    }

    async.auto({
        //get the User collection
        'userCollection': [function (next2) {
            db.collection('user', next2);
        }],

        //find user data by email
        'findUser': ['userCollection', function (next2, result) {
            if (!result.userCollection) {
                return next2(new Error('Database unavailable.'));
            }

            result.userCollection.findOne({'email': user.email}, next2);
        }],

        //if the user doesn't exist, exit
        'checkUser': ['userCollection', 'findUser', function (next2, result) {
            if (!result.findUser) {
                return next2(new Error('User ' + user.email + ' has not been granted access.'));
            }

            next2(null, true);
        }],

        //otherwise, update user profile
        'update': ['userCollection', 'checkUser', function (next2, result) {
            user.last_login = (new Date()).valueOf();
            result.userCollection.update({'email': user.email}, {'$set': user}, {safe: true, fsync: true}, next2);
        }],

        //fetch updated data, blacklisting sensitive properties
        'updatedUser': ['userCollection', 'update', function (next2, result) {
            result.userCollection.findOne({ 'id': user.id }, blacklist.user, next2);
        }]
    },
        function (err, results) {

            if (err) {
                next(err);
                return;
            }

            app.log.info('login: ' + user.email + ' timestamp: ' + user.last_login);

            //send the updated user to the client
            next(null, results.updatedUser);

        });
};

exports.setup = function (app) {
    "use strict";

    var url         = app.config.publicURL,
        returnURL   = urlutil.normalize(url + '/' + app.config.prefix + '/' + app.config.auth.openid.callback),
        self        = this;

    if (!url) {
        throw new Error('No public URL has been configured for this instance of Survana ' +
            'and we cannot make up a default value. \nPlease edit config.js and set the publicURL ' +
            'property. e.g. exports.publicURL="http://example.com/"');
    }

    passport.use(new OpenIDStrategy({
        returnURL:  returnURL,
        realm:      url,
        profile:    true
    },
        function (identifier, profile, done) {

            var user,
                name = '',
                email = '';

            //extract name (sometimes displayName contains 'undefined' - avoid that case)
            if (profile.displayName && (profile.displayName.indexOf('undefined') < 0)) {
                name = profile.displayName;
            }

            //extract e-mail
            if (profile.emails && profile.emails[0] && profile.emails[0].value) {
                email = profile.emails[0].value;
            }

            user = {
                'id': identifier,
                'name': name,
                'email': email
            };

            //always allow access to admin
            if (email === app.config.superuser) {
                done(null, user);
                return;
            }

            self.checkuser(app, user, done);
        }));

    passport.serializeUser(function (user, done) {
        done(null, user);
    });

    passport.deserializeUser(function (obj, done) {
        done(null, obj);
    });
};
