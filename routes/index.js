var path=require('path');
var async=require('async');

var study_blacklist={
    '_id':0,
    'keys':0
};

var form_blacklist={
    '_id':0
};

exports.index=function(req,res,next)
{
	var len=req.originalUrl.length;
    var studies=[];
    var forms=[];

	//make sure the browser is using a trailing slash
	if (req.originalUrl[len-1]!=='/')
		return res.redirect(req.originalUrl+'/');

	async.waterfall([
		//get the 'study' collection
		function getCollection(next2)
        {
			req.app.db.collection('study',next2)
		},

		//find all study documents, prevent _id from showing up
		function findAllStudies(col,next2)
        {
			col.find({},study_blacklist).toArray(next2);
		},

        //get the 'form' collection
        function getFormCollection(result,next2)
        {
            studies=result;
            req.app.db.collection('form',next2)
        },

        //find all form documents, prevent '_id' from showing up
        function getForms(col,next2)
        {
            col.find({},form_blacklist).toArray(next2);
        },

        //store the dataset for later
        function formResults(result,next2)
        {
            forms=forms.concat(result);

            next2(null,studies,forms);
        }
    ],

    //render the index page with the form and study datasets
    function dislayPage(err,studies,forms)
    {
        if (err)
            return next(err);

        var server_names=[];

        for (var i in req.app.config.publishers)
            server_names.push(i);

        res.render('index',{
            config:req.app.config,
            forms:forms,
            studies:studies,
            publishers:server_names
        });
    });
}
