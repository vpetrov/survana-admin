/** routes/user.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var async = require('async'),
    blacklist = require('../lib/blacklist');

exports.create = function (req, res, next) {
    "use strict";

    var db = req.app.db,
        user = req.body;

    if (!user || !user.email) {
        return next(new Error("Invalid e-mail address"));
    }

    async.auto({
        'userCollection': [function (next2) {
            db.collection('user', next2);
        }],

        'existingUser': ['userCollection', function (next2, result) {
            result.userCollection.findOne({'email': user.email}, next2);
        }],

        'checkUser': ['existingUser', function (next2, result) {
            if (result.existingUser && result.existingUser.email) {
                return next2(new Error('This e-mail ' + user.email + ' has already been used.'));
            }

            next2(null, true);
        }],

        'addUser': ['userCollection', 'checkUser', function (next2, result) {
            user.id = '';
            user.last_login = 0;

            result.userCollection.insert(user, {safe: true, fsync: true}, next2);
        }],

        'insertedUser': ['userCollection', 'addUser', function (next2, result) {
            //always return what is actually stored in the DB, not what we think was stored.
            result.userCollection.findOne({'email': user.email}, blacklist.user, next2);
        }]
    },

        function processResult(err, result) {

            if (err) {
                next(err);
                return;
            }

            res.send(result.insertedUser);
        });
};
