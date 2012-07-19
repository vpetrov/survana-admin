var path=require('path');
var step=require('step');

var forms=require('./store/forms.json'); //TODO: remove me

function requirejs_libs(config)
{
	var result={};
	
	for (l in config.lib)
		result[l]=path.join(config.lib[l],l);

	return result;
}

exports.index=function(req,res)
{	
	console.log(req.originalUrl);
	var len=req.originalUrl.length;
	
	//make sure the browser is using a trailing slash
	if (req.originalUrl[len-1]!=='/')
		return res.redirect(req.originalUrl+'/');
	
	step(
		//get the 'study' collection
		function getCollection(){
			req.app.db.collection('study',this)
		},
		
		//find all study documents
		function findAllStudies(err,col){
			if (err)
				throw err;
				
			col.find({}).toArray(this);
		},
		
		//render the page
		function displayPage(err,studies)
		{
			if (err)
				throw err;
				
			res.render('index',{
				config:req.app.config,
				require_libs:requirejs_libs(req.app.config),
				forms:forms,
				studies:studies
			});
		}
	);
}
