/** routes/index.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var path = require('path');
var async = require('async');
var pkg = require('../package.json');

var study_blacklist = {
    '_id': 0,
    'keys': 0
};

var form_blacklist = {
    '_id': 0
};

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

    async.auto({
        //get the 'study' collection
        'studyCollection': function (next2) {
            db.collection('study', next2);
        },

        //get the 'form' collection
        'formCollection': function (next2) {
            db.collection('form', next2);
        },

        //find all study documents, prevent _id from showing up
        'studies': ['studyCollection', function (next2, result) {
            result.studyCollection.find({}, study_blacklist).toArray(next2);
        }],

        //find all form documents, prevent '_id' from showing up
        'forms': ['formCollection', function (next2, result) {
            result.formCollection.find({}, form_blacklist).toArray(next2);
        }]
    },
        //render the index page with the form and study datasets
        function dislayPage(err, result) {

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
                forms: result.forms,
                studies: result.studies,
                publishers: serverNames,
                pkg: pkg
            });
        });
};
