var path=require('path');
var step=require('step');

exports.index=function(req,res)
{
	var len=req.originalUrl.length;
    var studies=[];
    var forms=[];

	//make sure the browser is using a trailing slash
	if (req.originalUrl[len-1]!=='/')
		return res.redirect(req.originalUrl+'/');

	step(
		//get the 'study' collection
		function getCollection()
        {
			req.app.db.collection('study',this)
		},

		//find all study documents, prevent _id from showing up
		function findAllStudies(err,col)
        {
			if (err)
				throw err;

			col.find({},{'_id':0}).toArray(this);
		},

		//store the dataset for later
		function studyResults(err,result)
		{
			if (err) throw err;

            studies=result;

            return studies;
        },

        //get the 'form' collection
        function getFormCollection(err)
        {
            if (err) throw err;

            req.app.db.collection('form',this)
        },

        //find all form documents, prevent '_id' from showing up
        function getForms(err,col)
        {
            if (err) throw err;

            col.find({},{'_id':0}).toArray(this);
        },

        //store the dataset for later
        function formResults(err,result)
        {
            if (err) throw err;

            forms=forms.concat(result);

            return forms;
        },

        //render the index page with the form and study datasets
        function dislayPage(err)
        {
            if (err) throw err;

			res.render('index',{
				config:req.app.config,
				forms:forms,
				studies:studies
			});
		}
	);
}
