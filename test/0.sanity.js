var vows = require('vows');
var assert = require('assert');
var suite = vows.describe('sanity');

var encryption_min = 128;

suite.addBatch({
    'config': {
        topic: require('../config.js'),
        'has title': function (topic) {
            "use strict";
            assert.isString(topic.title);
        },
        'has publishers': function (topic) {
            "use strict";
            assert.isObject(topic.publishers);
        },
        'has stores': function (topic) {
            "use strict";
            assert.isObject(topic.stores);
        },
        'has encryption': function (topic) {
            "use strict";
            assert.isObject(topic.encryption);
            assert.isNumber(topic.encryption.keys);
            assert.isNumber(topic.encryption.bits);
            assert.isTrue(topic.encryption.keys > 0);
            assert.isTrue((topic.encryption.bits % 2) === 0);
            assert.isTrue(topic.encryption.bits > encryption_min);
        },
        'has routes': function (topic) {
            "use strict";
            assert.isObject(topic.routes);
        },
        'has declared dependencies': function (topic) {
            "use strict";
            assert.isObject(topic.lib);
        },
        'has database info': function (topic) {
            "use strict";
            assert.isObject(topic.db);
            assert.isString(topic.db.name);
        }
    }
});

suite['export'](module); //'export' is a reserved word
