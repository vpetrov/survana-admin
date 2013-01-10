/** config.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

exports.title = 'Survana Administration';

//the first server listed is the default publishing server
exports.publishers = {
};

exports.stores = {

};

//the more keys there are to generate, the slower Survana will be at creating surveys and importing responses.
exports.encryption = {
    'keys': 10,
    'bits': 1024
};

exports.routes = {
    'GET': {
        '/': 'index',
        '/study': {'study': 'list'},
        '/study/:id': {'study': 'get'},
        '/form': {'form': 'list'},
        '/form/:id': {'form': 'get'}
    },

    'POST': {
        '/study': {'study': 'create'},
        '/form': {'form': 'create'}
    },

    'PUT': {
        '/study/:id': {'study': 'update'},
        '/form/:id': {'form': 'update'}
    },

    'DELETE': {
        '/study/:id': {'study': 'remove'},
        '/form/:id': {'form': 'remove'}
    }
};

exports.lib = {
    'backbone': 'lib/backbone/0.9.2',
    'bootstrap': 'lib/bootstrap/2.2.1',
    'jquery': 'lib/jquery/1.7.2',
    'jquery-ui': 'lib/jquery/ui/1.8.21',
    'require': 'lib/require/2.0.4',
    //'underscore':'lib/underscore/1.4.3',
    'underscore': 'lib/lodash/0.10',
    'ace': 'lib/ace/0.2.0'
};

/* default database config */
exports.db = {
    name: 'admin',
    host: 'localhost',
    port: 27017,
    //see https://github.com/christkv/node-mongodb-native/blob/master/docs/database.md
    server_options: {
        encoding: 'utf8',
        auto_reconnect: true
    },
    db_options: {
        native_parser: false, //couldn't get the BSON C++ parser to work on OS X
        strict: false            //false will prevent new collections from being autocreated
    }
};
