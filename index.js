/** index.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

/** app must have 'log' and 'dirname' properties */

var moduleName = require("./package.json").name,
    path = require('path'),
    fs = require('fs'),
    passport = require('passport'),
    auth = require('./lib/auth'),
    HTTP_UNAUTHORIZED = 401;

exports.config = require('./config');

/**
 * Ensures that all admin pages are only accessible to authenticated users
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
exports.ensureAuthenticated = function (req, res, next) {
    "use strict";

    if (req.isAuthenticated()) {
        return next();
    }

    //AJAX?
    if ((req.header('Content-Type') === 'application/json') || (req.header('X-Requested-With') === 'XMLHttpRequest')) {
        return res.send({
            success: 0,
            logged_out: true,
            message: "Your session has expired. Please <a href='/login'>login</a>"
        }, HTTP_UNAUTHORIZED);
    }

    return res.redirect('login');
};

exports.routing = function (app, config, method, route, controller, action, handler) {
    "use strict";

    var routes = config.auth.routes;

    //check to see if there is a special auth.routes entry for this route
    if (routes[method] && (routes[method][route] !== undefined)) {
        //if there is, then if it's true, this route needs to be protected
        if (routes[method][route] === true) {
            return exports.ensureAuthenticated;
        }
    } else if (config.auth['default'] === true) {
        //else, there is no exception for this route and by default, it must be protected
        return exports.ensureAuthenticated;
    }

    //by default do not return any middleware routing functions
    return null;
};

exports.server = function (survana, express) {
    "use strict";

    var app = express.createServer();

    this.app = app;

    app.configure(function () {
        app.set('views', __dirname + '/views');
        app.set('view engine', 'ejs');
        app.set('view options', {
            layout: false
        });

        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(express.cookieParser());
        app.use(express.session({ secret: 'Survana:)' }));
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(express['static'](__dirname + '/public')); //'static' is a reserved keyword
        app.use(app.router);

        app.log = survana.log.sub(moduleName);
        app.dirname = __dirname;
    });

    //set up routes
    survana.routing(app, this.config, this.routing);

    app.log.info('reporting in!');

    app.config = this.config;
    app.dbserver = new survana.db(this.config.db);

    //open a database connection
    app.dbserver.connect(function (db) {
        app.db = db;
    },
        function (error) {
            throw error;
        });

    this.config.publishers = survana.readKeys(this.config.publishers);

    auth.setup(app);

    return this.app;
};
