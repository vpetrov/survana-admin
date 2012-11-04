var path = require('path');
var async = require('async');

var study_blacklist = {
    '_id': 0,
    'keys': 0
};

var form_blacklist = {
    '_id': 0
};

exports.index = function (req, res, next) {
    "use strict";

    var len = req.originalUrl.length,
        studies = [],
        forms = [];

    //make sure the browser is using a trailing slash
    if (req.originalUrl[len - 1] !== '/') {
        res.redirect(req.originalUrl + '/');
        return;
    }

    async.waterfall({
        //get the 'study' collection
        'getCollection': function (next2) {
            req.app.db.collection('study', next2);
        },

        //find all study documents, prevent _id from showing up
        'findAllStudies': function (col, next2) {
            col.find({}, study_blacklist).toArray(next2);
        },

        //get the 'form' collection
        'getFormCollection': function (result, next2) {
            studies = result;
            req.app.db.collection('form', next2);
        },

        //find all form documents, prevent '_id' from showing up
        'getForms': function (col, next2) {
            col.find({}, form_blacklist).toArray(next2);
        },

        //store the dataset for later
        'formResults': function (result, next2) {
            forms = forms.concat(result);

            next2(null, studies, forms);
        }
    },

        //render the index page with the form and study datasets
        function dislayPage(err, studies, forms) {
            var publishers = req.app.config.publishers,
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
                config: req.app.config,
                forms: forms,
                studies: studies,
                publishers: serverNames
            });
        });
};
