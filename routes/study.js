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
 *
 * @param req
 * @param res
 */
exports.get = function (req, res) {
    "use strict";

    res.send('Study::get');
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

exports.remove = function (req, res) {
    "use strict";

    res.send('Study::remove');
};
