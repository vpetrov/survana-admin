exports.title='iData Administration';
exports.study_url_prefix='http://vpetrov.neuroinfo.org/';

exports.routes={
    'GET':{
    	'/': 			'index',
    	'/study':		{'study':'list'},
    	'/study/:id': 	{'study':'get'}
    },
    
    'POST':{
    	'/study': 		{'study':'create'}
    },
    
    'PUT':{
    	'/study/:id': 	{'study':'update'}
    },
    
    'DELETE':{
    	'/study/:id': 	{'study':'remove'}
    }
};

exports.lib={
	'backbone':'lib/backbone/0.9.2',
	'bootstrap':'lib/bootstrap/2.0.4',
	'jquery':'lib/jquery/1.7.2',
	'jquery-ui':'lib/jquery/ui/1.8.21',
	'require':'lib/require/2.0.4',
	//'underscore':'lib/underscore/1.3.3'
	'underscore':'lib/lodash/0.4.2'
};

/* default database config */
exports.db={
	name:'admin',
	host:'localhost',
	port:27017,
	//see https://github.com/christkv/node-mongodb-native/blob/master/docs/database.md
	server_options:{
		encoding:'utf8',
		auto_reconnect:true
	},
	db_options:{
		native_parser:true,
		strict:true
	},
}
