/** routes/index.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var async = require('async');
var pkg = require('../package.json');
var urlutil = require('../lib/urlutil');
var blacklist = require('../lib/blacklist');

exports.index = function (req, res, next) {
    "use strict";

    var app = req.app,
        db = app.db,
        len = req.originalUrl.length;

    //make sure the browser is using a trailing slash
    if (req.originalUrl[len - 1] !== '/') {
        res.redirect(req.originalUrl + '/');
        return;
    }

    //and that the request url doesn't have multiple slashes at the end (it messes up url routing)
    if (req.originalUrl[len - 2] === '/') {
        res.redirect(urlutil.normalize(req.originalUrl));
        return;
    }

    async.auto({
        //get the 'study' collection
        'studyCollection': function (next2) {
            db.collection('study', next2);
        },

        //get the 'form' collection
        'formCollection': function (next2) {
            db.collection('form', next2);
        },

        'userCollection': function (next2) {
            db.collection('user', next2);
        },

        //find all study documents, prevent _id from showing up
        'studies': ['studyCollection', function (next2, result) {
            result.studyCollection.find({}, blacklist.study).toArray(next2);
        }],

        //find all form documents, prevent '_id' from showing up
        'forms': ['formCollection', function (next2, result) {
            result.formCollection.find({}, blacklist.form).toArray(next2);
        }],

        'users': ['userCollection', function (next2, result) {
            result.userCollection.find({}, blacklist.user).toArray(next2);
        }]
    },
        //render the index page with the form and study datasets
        function displayPage(err, result) {

            var publishers = app.config.publishers,
                serverNames = [],
                i;

            if (err) {
                next(err);
                return;
            }

            if (publishers) {
                for (i in publishers) {
                    if (publishers.hasOwnProperty(i)) {
                        serverNames.push(i);
                    }
                }
            }

            res.render('index', {
                config: app.config,
                user: req.user,
                forms: result.forms,
                studies: result.studies,
                publishers: serverNames,
                users: result.users,
                pkg: pkg
            });
        });
};
