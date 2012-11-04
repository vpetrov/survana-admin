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
        col = null,
        form = req.body,
        gid = form.gid;

    if (typeof (form) !== 'object') {
        throw "Invalid request";
    }

    form.data = JSON.parse(form.data);

    async.waterfall({

        'getCollection': function (next2) {
            db.collection('form', next2);
        },

        'generateUniqueId': function (collection, next2) {
            col = collection;
            db.uniqueId(collection, 'id', next2);
        },

        'setId': function (uniqueId, next2) {
            form.id = uniqueId;
            form.created_on = (new Date()).valueOf();

            next2(null, form);
        },

        //S1 and S2 are mutually exclusive. 'gid' is used as guard.
        'S1_generateGroupId': function (form, next2) {
            if (gid === '0') {
                db.uniqueId(col, 'id', next2);
            } else {
                next2(null, form);  //does the form have a group already?
            }
        },

        'S1_setGroup': function (uniqueId, next2) {
            if (gid === '0') {
                form.gid = uniqueId;
                form.group = form.title;

                next2(null, form);
            } else {
                next2(null, form);
            }
        },

        'S2_findGroup': function (form, next2) {
            if (gid === '0') {
                next2(null, form);
            } else {
                col.findOne({'gid': gid}, next2);
            }
        },

        'S2_updateGroup': function (result, next2) {
            if (gid === '0') {
                next2(null, form);
            } else if (!result) {
                next2(new Error('Group id ' + gid + ' not found.'));
            } else {
                form.group = result.group;
                next2(null, form);
            }
        },

        'addForm': function (form, next2) {
            col.insert(form, {safe: true, fsync: true}, next2);
        }
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
exports.update = function (req, res) {
    "use strict";

    var db = req.app.db,
        form = req.body,
        formId = req.params.id,
        col;

    if (typeof (form) !== 'object') {
        throw 'Invalid request';
    }

    //TODO: validate input data (malicious js functions?)

    async.waterfall({
        'getCollection': function (next) {
            db.collection('form', next);
        },

        'getExistingForm': function (collection, next) {
            col = collection;
            col.findOne({'id': formId}, next);
        },

        'updateForm': function (item, next) {
            if (!item) {
                res.send('Form not found', HTTP_NOT_FOUND);
                return;
            }

            //unset server generated fields
            delete form._id;
            delete form.id;
            delete form.created_on;

            //perform db update
            col.update({'id': formId}, {'$set': form}, {safe: true, fsync: true}, next);
        }
    },
        function processResult(err) {
            if (err) {
                throw err;
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
