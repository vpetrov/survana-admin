exports.list=function(req,res)
{
	req.send('Form::list');'
}

exports.get=function(req,res)
{
	req.send('Form::get');
}

exports.create=function(req,res)
{
	req.send('Form::create');
}

exports.update=function(req,res)
{
	req.send('Form::update');
}

exports.remove=function(req,res)
{
	req.send('Form::remove');
}
