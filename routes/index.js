var path=require('path');

function requirejs_libs(config)
{
	var result={};
	
	for (l in config.lib)
		result[l]=path.join(config.lib[l],l);

	return result;
}

exports.index=function(req,res)
{
	console.log(req.app.config);
	
	res.render('index',{
		config:req.app.config,
		require_libs:requirejs_libs(req.app.config),
		forms:{},
		studies:{}
	});
}
