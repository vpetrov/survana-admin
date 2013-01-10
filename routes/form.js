/** routes/form.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var async = require('async');

var HTTP_NOT_FOUND = 404;

exports.list = function (req, res) {
    "use strict";

    res.send('Form::list');
};

exports.get = function (req, res) {
    "use strict";

    res.send('Form::get');
};

exports.create = function (req, res, next) {
    "use strict";

    var db = req.app.db,
        form = req.body,
        gid = form.gid;

    if (typeof (form) !== 'object') {
        throw "Invalid request";
    }

    //when forking, the data property is sent as JSON
    if (typeof (form.data) === 'string') {
        form.data = JSON.parse(form.data);
    }

    async.auto({

        'formCollection': [function (next2) {
            db.collection('form', next2);
        }],

        'uniqueId': ['formCollection', function (next2, result) {
            db.uniqueId(result.formCollection, 'id', next2);
        }],

        'uniqueGroupId': ['formCollection', function (next2, result) {
            db.uniqueId(result.formCollection, 'id', next2);
        }],

        'siblingForm': [ 'formCollection', function (next2, result) {
            if (gid !== 0) {
                result.formCollection.findOne({'gid': gid}, next2);
            } else {
                next2(null, false);
            }

        }],

        'formWithId': ['uniqueId', function (next2, result) {
            form.id = result.uniqueId;
            form.created_on = (new Date()).valueOf();

            next2(null, form);
        }],

        'formWithGroup': ['uniqueId', 'uniqueGroupId', 'siblingForm', function (next2, result) {

            if (result.siblingForm) {
                form.group = result.siblingForm.group;
            } else if (gid !== 0) {
                next2(null, new Error('Group ID ' + gid + ' not found.'));
            } else {
                form.gid = result.uniqueId;
                form.group = form.title;
            }

            next2(null, form);
        }],

        'addForm': ['formCollection', 'formWithId', 'formWithGroup', function (next2, result) {
            result.formCollection.insert(form, {safe: true, fsync: true}, next2);
        }]
    },

        function processResult(err) {
            if (err) {
                next(err);
                return;
            }

            delete form._id; //remove internal ID
            res.send(form);
        });
};

/** UPDATE
 */
exports.update = function (req, res, next) {
    "use strict";

    var db = req.app.db,
        form = req.body,
        formId = req.params.id;

    if (typeof (form) !== 'object') {
        throw 'Invalid request';
    }

    async.auto({
        'formCollection': [function (next2) {
            db.collection('form', next2);
        }],

        'serverForm': ['formCollection', function (next2, result) {
            result.formCollection.findOne({'id': formId}, next2);
        }],

        'updateForm': ['formCollection', 'serverForm', function (next2, result) {
            if (!result.serverForm) {
                res.send('Form not found', HTTP_NOT_FOUND);
                return;
            }

            //unset server generated fields
            delete form._id;
            delete form.id;
            delete form.created_on;

            //perform db update
            result.formCollection.update({'id': formId}, {'$set': form}, {safe: true, fsync: true}, next2);
        }]
    },
        function processResult(err) {
            if (err) {
                next(err);
                return;
            }

            delete form._id;

            //send server version back to client
            res.send(form);
        });
};

exports.remove = function (req, res) {
    "use strict";

    res.send('Form::remove');
};
