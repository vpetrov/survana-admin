/** app must have 'log' and 'dirname' properties */

var name=require("./package.json").name;
var path=require('path');
var fs=require('fs');

exports.config=require('./config');

exports.server=function(survana,express)
{
	var app=this.app=express.createServer();

	app.configure(function()
	{
		app.set('views', __dirname + '/views');
		app.set('view engine','ejs');
		app.set('view options',{
			layout:false
		});

        app.use(express.methodOverride());
        app.use(express.bodyParser());
        app.use(express.static(__dirname+'/public'));
        app.use(app.router);

        app.log=survana.log.sub(name);
        app.dirname=__dirname;
    });

    //set up routes
    survana.routing(app,this.config.routes);

	app.log.info('reporting in!');

	app.config=this.config;
	app.dbserver=new survana.db(this.config.db);

	//open a database connection
	app.dbserver.connect(function(db){
		app.db=db;
	},
	function(error){
		throw error;
	});

    this.config.publishers=survana.readKeys(this.config.publishers);

	return this.app;
}
