/** routes/study/publish.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var async = require('async');
var request = require('request');

var blacklist = require('../../lib/blacklist');

var HTTP_OK = 200;

// -[ PRIVATE FUNCTIONS ]-------------------------------------------------------------------------------CUT HERE-------

/**
 *
 * @param item
 * @param callback
 */
function publishWorker(item, callback) {
    "use strict";

    var study = item.study,
        publisher = item.publisher,
        keyID = item.keyID,
        privateKey = item.privateKey,
        requestOpt;

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
        callback(null, result);
    });
}

/**
 *
 * @param study
 * @param publishers
 * @param keyID
 * @param privateKey
 * @param publishCallback
 */
function publish(study, publishers, keyID, privateKey, publishCallback) {
    "use strict";

    var copies = [],
        i;

    //nowhere to publish?
    if (publishers.length) {

        //remove all private keys from the study object
        arrays.blacklist(study.keys, blacklist.keys);

        //remove properties that shouldn't be published
        obj.blacklist(study, blacklist.publish);

        //create publishers
        for (i = 0; i < publishers.length; i += 1) {
            copies.push({
                'publisher': publishers[i],
                'study': study,
                'keyID': keyID,
                'privateKey': privateKey
            });
        }

        async.map(copies, publishWorker, function (err, results) {
            publishCallback(null, results);
        });
    }
}

// -[ PUBLIC FUNCTIONS ]--------------------------------------------------------------------------------CUT HERE-------

/**
 *
 * @param serverStudy
 * @param servers
 * @param req
 * @param res
 * @param next
 */
exports.publish = function (serverStudy, servers, req, res, next) {
    "use strict";

    var app = req.app,
        db = app.db,
        clientStudy = req.body;

    if (!servers || !servers.length) {
        next(new Error('No publishing servers'));
        return;
    }

    //replace all form ids with copies of the actual form data and then publish.
    async.auto({
        'formCollection': [function (next2) {
            db.collection('form', next2);
        }],

        'studyForms': ['formCollection', function (next2, result) {
            result.formCollection.find({
                'id': {
                    '$in': clientStudy.forms
                }
            }, blacklist.form).toArray(next2);
        }],

        'fullStudy': ['studyForms', function (next2, result) {
            var found = [],
                notFound = [],
                forms = result.studyForms,
                index,
                i;

            if (!forms || !forms.length) {
                next2(new Error('Failed to get list of forms from the database.'));
                return;
            }

            //have all the forms been found in the database?
            //first,build an array of IDs that were found
            for (i = 0; i < forms.length; i += 1) {
                found.push(forms[i].id);
            }

            notFound = arrays.unique(clientStudy.forms, found);

            if (notFound.length) {
                next2(new Error('The following forms could not be found: ' + notFound.join(',')));
                return;
            }

            //todo: make sure that all forms were published before publishing the study

            //add all the forms in the correct order (since the array returned by mongodb might not match the
            //order in which the user has arranged the forms)
            for (i = 0; i < forms.length; i += 1) {
                index = clientStudy.forms.indexOf(forms[i].id);
                if (index > -1) {
                    serverStudy.forms[index] = forms[i];
                }
            }

            next2(null, serverStudy);
        }],

        //publish the study to all servers in parallel and only call next function when ready
        'publishedStudies': ['fullStudy', function (next2, result) {
            publish(result.fullStudy, servers, app.keyID, app.privateKey, next2);
        }],

        'publishResult': ['fullStudy', 'publishedStudies', function (next2, result) {
            var errors = [],
                publishedStudies = result.publishedStudies,
                publishers = serverStudy.publishers || [],
                urls = serverStudy.urls || {},
                i;

            for (i = 0; i < publishedStudies.length; i += 1) {
                if (publishedStudies[i].success === 1) {
                    //add the publisher to list of places where this study has been published
                    publishers.push(publishedStudies[i].server);
                    //add the public URL
                    urls[publishedStudies[i].server] = publishedStudies[i].url;
                } else {
                    errors.push("[" + publishedStudies[i].server + "] " + publishedStudies[i].message);
                }
            }

            if (errors.length) {
                next2(new Error("Failed to publish study '" + serverStudy.id + "': " + errors.join(". ")));
            } else {
                next2(null, {
                    'publishers': publishers,
                    'urls': urls
                });
            }
        }]
    },
        function processResult(err, result) {
            if (err) {
                next(err);
                return;
            }

            //return query to update only certain fields
            next(null, {
                '$set': result.publishResult
            });
        });
};

