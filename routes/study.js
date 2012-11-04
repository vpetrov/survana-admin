var async = require('async');
var ursa = require('ursa');
var request = require('request');

var HTTP_OK = 200;
var HTTP_NOT_FOUND = 404;

//an option object for use with mongodb. it prevents the db from returning sensitive information.
var study_blacklist = {
    '_id': 0,
    'keys': 0
};

var form_blacklist = {
    '_id': 0
};

//properties to delete when publishing a study
var publish_blacklist = {
    '_id': 0,
    'publishers': 0,
    'urls': 0,
    'published': 0
};


function publishWorker(item, next) {
    "use strict";

    var study = item.study,
        publisher = item.publisher,
        keyID = item.keyID,
        privateKey = item.privateKey,
        requestOpt,
        i;

    console.log('Publishing study ', study.id, ' to server: ', publisher.name, " with URL", publisher.url);

    //remove all private keys from the study object
    for (i in study.keys) {
        if (study.keys.hasOwnProperty(i)) {
            delete study.keys[i].privateKey;
        }
    }

    console.log('signature', privateKey.hashAndSign('sha256', JSON.stringify(study), 'utf8', 'hex'));

    //construct the request option object
    requestOpt = {
        uri: publisher.url,
        method: 'POST',
        json: {
            'study': study,
            'keyID': keyID,
            'signature': privateKey.hashAndSign('sha256', JSON.stringify(study), 'utf8', 'hex')
        },
        encoding: 'utf8'
    };

    //make an http/https request to the publisher
    request(requestOpt, function (err, response, body) {

        //by default, assume an error happened
        var result = {
            'success': 0,
            'message': err,
            'url': null,
            'server': publisher.name
        };

        //but if 50 years of network design miraculously brought the bits back over the wire, then read the public URL.
        if (!err) {
            if (typeof (body) === 'object') {
                //let's see if the server was nice and returned a meaningful status code (which it should)
                if (response.statusCode === HTTP_OK) {
                    result.success = 1;    //bitter sweet
                    result.url = body.url; //this lets every server designate their own (permanent) URLs for each study
                } else if (body.message) {
                    result.message = body.message; //a logical error happened, let's hope the server returned it to us
                } else {
                    result.message = "No details about the error have been received from the publishing service.";
                }
            } else {
                //if the JSON returned was invalid, this means the server responded with 200, but it might have been
                //an HTML page.
                result.message = 'Invalid response received from the publishing service (' + body.length + ').';
            }

        }

        //we're done!
        next(null, result);
    });
}


exports.list = function (req, res) {
    "use strict";

    res.send('Study::list');
};

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
        study = req.body,
        col;


    if (typeof (study) !== 'object') {
        next(new Error('Invalid request'));
        return;
    }

    async.waterfall({
        'getCollection': function (next2) {
            db.collection('study', next2);
        },

        'generateUniqueId': function (collection, next2) {
            col = collection;
            db.uniqueId(collection, 'id', next2);
        },

        'addStudy': function (uniqueId, next2) {
            study.id = uniqueId;
            study.created_on = (new Date()).valueOf();
            study.keys = exports.genkeys(study, config.encryption);

            col.insert(study, {safe: true, fsync: true}, next2);
        },

        'prepareResult': function (result, next2) {
            //always return what is actually stored in the DB, not what we think was stored.
            col.findOne({'id': study.id}, study_blacklist, next2);
        }
    },

        function processResult(err, study) {
            if (err) {
                next(err);
                return;
            }

            res.send(study);
        });
};

/** UPDATE
 */
exports.update = function (req, res, next) {
    "use strict";

    var app = req.app,
        db = app.db,
        config = app.config,
        study = req.body,
        studyId = req.params.id,
        publish = false,
        col;

    if (typeof (study) !== 'object') {
        next(new Error("Invalid request"));
        return;
    }

    //TODO: validate input data (malicious js functions?)

    async.waterfall({
        'getCollection': function (next) {
            db.collection('study', next);
        },

        'getExistingStudy': function (collection, next) {
            col = collection;
            col.findOne({'id': studyId}, next);
        },

        'prepareStudy': function (item, next) {

            var servers = [],
                publishServers,
                server,
                i;

            if (!item) {
                res.send('Study not found', HTTP_NOT_FOUND);
                return;
            }

            //unset server generated fields
            delete study._id;
            delete study.id;
            delete study.created_on;

            //check to see if the client added any new publishers
            publishServers = arrays.diff(study.publishers, item.publishers);

            //skip to the next step if no publishing is necessary
            if (!publishServers || !publishServers.length) {
                next(null, null);
                return;
            }

            //publish the study on the new servers, if necessary
            //build a list of publish servers
            for (i in publishServers) {
                if (publishServers.hasOwnProperty(i)) {
                    server = config.publishers[publishServers[i]];
                    server.name = publishServers[i];
                    servers.push(server);
                }
            }

            study.publishers = item.publishers; //only the successful publishers will be added back to this list

            //replace all form ids with copies of the actual form data and then publish
            //first, obtain the forms from the database
            async.waterfall({
                'getCollection': function (next2) {
                    db.collection('form', next2);
                },

                'getAllFormsInStudy': function (col, next2) {
                    col.find({
                        'id': {
                            '$in': item.forms
                        }
                    }, form_blacklist).toArray(next2);
                },

                'replaceCurrentForms': function (forms, next2) {
                    var found = [],
                        notFound = [],
                        fullStudy,
                        form,
                        index,
                        i;

                    if (!forms || !forms.length) {
                        next2(new Error('Failed to get list of forms from the database.'));
                        return;
                    }

                    //have all the forms been found in the database?
                    if (forms.length !== item.forms.length) {
                        //oops. some forms are missing. get their IDs then.

                        //first,build an array of IDs that were found
                        for (i in forms) {
                            if (forms.hasOwnProperty(i)) {
                                found.push(forms[i].id);
                            }
                        }

                        notFound = arrays.diff(item.forms, found);

                        next2(new Error('The following forms could not be found: ' + notFound.join(',')));
                        return;
                    }

                    //todo: make sure that all forms were published before publishing the study

                    fullStudy = item;

                    //add all the forms in the correct order (since the array returned by mongodb might not match the
                    // order in which the user has arranged the forms)
                    for (i in forms) {
                        if (forms.hasOwnProperty(i)) {
                            form = forms[i];

                            index = fullStudy.forms.indexOf(form.id);
                            fullStudy.forms[index] = form;
                        }
                    }

                    next2(null, fullStudy);
                }
            },
                function processResult(err, fullStudy) {
                    if (err) {
                        next(err);
                        return;
                    }

                    //make sure the internal mongodb ID is not published
                    delete fullStudy._id;

                    //publish the study (and then proceed to the next step)
                    module.exports.publish(fullStudy, servers, app.keyID, app.privateKey, next);
                });
        },

        'updateStudy': function (results, next) {
            var errors = [],
                i;

            //has the study been published somewhere?
            if (results && results.length) {
                //ensure some critical properties are available
                if (!study.publishers) {
                    study.publishers = [];
                    study.urls = {};
                }
                console.log('publish result', results);

                for (i in results) {
                    if (results.hasOwnProperty(i)) {
                        if (results[i].success === 1) {
                            //add the publisher to list of places where this study has been published
                            study.publishers.push(results[i].server);
                            //add the public URL to the study
                            study.urls[results[i].server] = results[i].url;
                        } else {
                            errors.push("[" + results[i].server + "] " + results[i].message);
                        }
                    }
                }

                if (errors.length) {
                    next(new Error("Failed to publish study '" + studyId + "': " + errors.join(". ")));
                }
            }

            //perform db update
            col.update({'id': studyId}, {'$set': study}, {safe: true, fsync: true}, next);
        },

        'prepareResult': function (ok, result, next) {
            if (!ok) {
                next(result.err);
                return;
            }

            //always return what is actually stored in the DB, not what we think was stored.
            col.findOne({'id': studyId}, study_blacklist, next);
        }
    },

        function processResult(err, study) {
            if (err) {
                next(err);   //defer to global error handler
                return;
            }

            //send server version back to client
            res.send(study);
        });
};

exports.remove = function (req, res) {
    "use strict";

    res.send('Study::remove');
};

exports.genkeys = function (study, encryption) {
    "use strict";

    var result = [],
        nkeys = encryption.keys,   //number of keys to generate
        bits = encryption.bits,    //number of bits per key
        keypair,
        publicKey,
        privateKey,
        i;

    //generate ALL the keys!
    for (i = 0; i < nkeys; i += 1) {
        keypair = ursa.generatePrivateKey(bits);      //a binary representation of the keypair
        publicKey = keypair.toPublicPem();            //extract public PEM from keypair
        privateKey = keypair.toPrivatePem();          //extract private PEM from keypair

        result.push({
            'keyID': keypair.toPublicSshFingerprint('hex'),                 //id of the key
            'bits': bits, //number of bits for the key
            'publicKey': publicKey.toString().replace(/\n|\r/gm, ""),       //the public PEM, no newlines
            'privateKey': privateKey.toString().replace(/\n|\r/gm, "")      //the private PEM, no newlines
        });
    }

    return result;
};

exports.publish = function (study, publishers, keyID, privateKey, next) {
    "use strict";

    var copies = [],
        i;

    //nowhere to publish?
    if (!publishers.length) {
        return;
    }

    //remove unwanted properties of the study
    for (i in publish_blacklist) {
        if (publish_blacklist.hasOwnProperty(i)) {
            delete study[i];
        }
    }

    //create publishing
    for (i in publishers) {
        if (publishers.hasOwnProperty(i)) {
            copies.push({
                'publisher': publishers[i],
                'study': study,
                'keyID': keyID,
                'privateKey': privateKey
            });
        }
    }

    async.map(copies, publishWorker, function (err, results) {
        next(null, results);
    });

};
