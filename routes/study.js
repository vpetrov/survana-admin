/** routes/study.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var async = require('async');
var request = require('request');
var blacklist = require('../lib/blacklist');
var keys = require('../lib/keys');

var publishHandler = require('./study/publish');


// -[ PUBLIC FUNCTIONS ]--------------------------------------------------------------------------------CUT HERE-------

/**
 *
 * @param req
 * @param res
 */
exports.list = function (req, res) {
    "use strict";

    res.send('Study::list');
};

/**
 * @param req
 * @param res
 */
exports.get = function (req, res) {
    "use strict";

    res.send('Study::get');
};

/**
 *
 * @param req
 * @param res
 */
exports.schema = function (req, res, next) {
    "use strict";

    var db = req.app.db,
        config = req.app.config,
        studyId = req.params.id;


    async.auto({
        'studyCollection': [function (next2) {
            db.collection('study', next2);
        }],

        'formCollection': [function (next2) {
            db.collection('form', next2);
        }],

        'study': ['studyCollection', function (next2, result) {
            //always return what is actually stored in the DB, not what we think was stored.
            result.studyCollection.findOne({'id': studyId}, blacklist.study, next2);
        }],

        'studyForms': ['formCollection', 'study', function (next2, result) {
            result.formCollection.find({
                'id': {
                    '$in': result.study.forms
                }
            }, blacklist.form).toArray(next2);
        }],

        'studyFormSchema': ['studyForms', function (next2, result) {
            var forms = result.studyForms,
                form,
                fields,
                i,
                j;

            for (i = 0; i < forms.length; i += 1) {
                fields = [];
                form = forms[i];

                for (j = 0; j < form.data.length; j += 1) {
                    var question = form.data[j],
                        id = question['s-id'],
                        group = question['s-group'],
                        type = question['s-type'],
                        qschema = {};

                    //skip questions with no ID
                    if (id === undefined) {
                        if (type === "question" || type === "rtf" || type === "label") {
                            continue;
                        } else {
                            id = "";
                        }
                    }

                    if (group !== undefined) {
                        type = 'group';
                    }

                    qschema = {
                        "id": id,
                        "type": type
                    };

                    if (group !== undefined) {
                        qschema.group = group;
                    }

                    fields.push(qschema);
                }

                forms[i] = {
                    'id': forms[i].id,
                    'fields': fields
                };
            }

            next2(null, forms);
        }],

        'fullStudy': ['studyFormSchema', 'study', function (next2, result) {
            var found = [],
                notFound,
                forms = result.studyFormSchema,
                study = result.study,
                i,
                j;

            if (!forms || !forms.length) {
                next2(new Error('Failed to get list of forms from the database.'));
                return;
            }

            //have all the forms been found in the database?
            //first,build an array of IDs that were found
            for (i = 0; i < forms.length; i += 1) {
                found.push(forms[i].id);
            }

            notFound = arrays.unique(study.forms, found);

            if (notFound.length) {
                next2(new Error('The following forms could not be found: ' + notFound.join(',')));
                return;
            }

            var serverStudy = {
                "id": study.id,
                "title": study.title,
                "forms": []
            };

            //add all the forms in the correct order (since the array returned by mongodb might not match the
            //order in which the user has arranged the forms)
            for (i = 0; i < forms.length; i += 1) {
                for (j = 0; j < study.forms.length; j += 1) {
                    if (study.forms[j] === forms[i].id) {
                        serverStudy.forms[j] = forms[i];
                    }
                }
            }

            next2(null, serverStudy);
        }]
    },

        function processResult(err, result) {

            if (err) {
                next(err);
                return;
            }

            var data;

            try {
                data = JSON.stringify(result.fullStudy);
            } catch (e) {
                next(e);
                return;
            }

            res.setHeader('Content-Disposition', 'attachment; filename=' + result.fullStudy.id + '.schema');
            res.setHeader('Content-Type', 'application/octet-stream');

            res.send(data);
        });
};

/** CREATE
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
exports.create = function (req, res, next) {
    "use strict";

    var db = req.app.db,
        config = req.app.config,
        study = req.body;


    if (typeof (study) !== 'object') {
        next(new Error('Invalid request'));
        return;
    }

    async.auto({
            'studyCollection': [function (next2) {
                db.collection('study', next2);
            }],

            'uniqueId': ['studyCollection', function (next2, result) {
                db.uniqueId(result.studyCollection, 'id', next2);
            }],

            'addStudy': ['studyCollection', 'uniqueId', function (next2, result) {
                study.id = result.uniqueId;
                study.created_on = (new Date()).valueOf();
                study.keys = keys.generate(config.encryption.keys, config.encryption.bits);

                result.studyCollection.insert(study, {safe: true, fsync: true}, next2);
            }],

            'serverStudy': ['studyCollection', 'uniqueId', 'addStudy', function (next2, result) {
                //always return what is actually stored in the DB, not what we think was stored.
                result.studyCollection.findOne({'id': result.uniqueId}, blacklist.study, next2);
            }]
        },

        function processResult(err, result) {

            if (err) {
                next(err);
                return;
            }

            res.send(result.serverStudy);
        });
};

/** UPDATE
 * This saves changes to 'study' documents. Some changes require other actions to be performed. For example,
 * adding a 'publisher' implies that the document must be published to a survana-study instance. Traditionally, such
 * changes would have been implemented RPC-style, via a POST to http://example.com/study/publish, which would have
 * simplified the server-side request handler. However, to simplify the client code and to emphasize REST over RPC,
 * Survana detects if special properties have been modified (such as 'publishers') and then makes use of publishHandler
 * to handle those changes.
 * @param req
 * @param res
 * @param next
 */
exports.update = function (req, res, next) {
    "use strict";

    var app = req.app,
        db = app.db,
        config = app.config,
        clientStudy = req.body,
        studyId = req.params.id,
        publish = false;

    if (typeof (clientStudy) !== 'object') {
        next(new Error("Invalid request"));
        return;
    }

    //TODO: validate input data! (malicious js functions?)

    async.auto({
            'studyCollection': [function (next2) {
                db.collection('study', next2);
            }],

            'serverStudy': ['studyCollection', function (next2, result) {
                result.studyCollection.findOne({'id': studyId}, next2);
            }],

            'publish': ['serverStudy', function (next2, result) {

                var servers = [],
                    publishServers,
                    server,
                    serverStudy = result.serverStudy,
                    i;

                //check to see if the client added any new publishers
                publishServers = arrays.diff(serverStudy.publishers, clientStudy.publishers);

                //skip to the next step if no publishing is necessary
                if (!publishServers || !publishServers.length) {
                    next2(null, false);
                    return;
                }

                //build a list of publish servers
                for (i = 0; i < publishServers.length; i += 1) {
                    server = config.publishers[publishServers[i]];
                    server.name = publishServers[i];
                    servers.push(server);
                }

                if (servers.length) {
                    publishHandler.publish(result.serverStudy, servers, req, res, next2);
                } else {
                    next2(null, false);     //if no servers were found, the result is 'false'
                }
            }],

            //this function determines what portions of the 'study' doc need updating. If a special handling function was
            //called (such as 'publish'), it will only update what the handler returns. Otherwise, a regular update is
            //performed, which is the equivalent of updating the document with user supplied input
            //note that all 'special' functions must be added to the dependency list and their result to the 'doc' var
            'update': [ 'studyCollection', 'publish', function (next2, result) {
                //use either the result of 'publish' or a filtered version of the study the client sent
                var doc = result.publish || { '$set': obj.blacklist(clientStudy, blacklist.study) };

                //update the study
                result.studyCollection.update({ 'id': studyId },
                    doc,
                    {safe: true, fsync: true},
                    next2);

            }],

            //read the study back from the database to ensure the client always has the latest snapshot
            'updatedStudy': ['studyCollection', 'update', function (next2, result) {
                result.studyCollection.findOne({ 'id': studyId }, blacklist.study, next2);
            }]
        },
        function (err, results) {

            if (err) {
                next(err);
                return;
            }

            //send the updated study to the client
            res.send(results.updatedStudy);

        });
};

exports.remove = function (req, res, next) {
    "use strict";

    res.send('Study::remove');
};

exports.key = function (req, res, next) {
    "use strict";

    var id = req.params.id,
        app = req.app,
        db = app.db;

    if (!id) {
        return next(new ClientError('Invalid request'));
    }


    async.auto({
            'studyCollection': [function (next2) {
                db.collection('study', next2);
            }],

            'study': ['studyCollection', function (next2, result) {
                //always return what is actually stored in the DB, not what we think was stored.
                result.studyCollection.findOne({'id': id}, { 'keys': 1 }, next2);
            }],

            'secretKey': ['study', function (next2, result) {
                var study = result.study;

                if (!study) {
                    return next2(new ClientError('Study not found.'));
                }

                if (!study.keys || !study.keys.length) {
                    return next2(new ClientError('No secret key has been found for this study.'));
                }

                return next2(null, study.keys);
            }]
        },
        function processResult(err, result) {

            var data;

            if (err) {
                next(err);
                return;
            }

            data = JSON.stringify({
                'server': app.keyID,
                'serverURL': app.config.publicURL,
                'study': id,
                'keys': result.secretKey
            });

            res.setHeader('Content-Disposition', 'attachment; filename=' + id + '.key');
            res.setHeader('Content-Type', 'application/octet-stream');
            res.send(data);
        });
};
