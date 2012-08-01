var step=require('step');

exports.list=function(req,res)
{
	res.send('Form::list');
}

exports.get=function(req,res)
{
	res.send('Form::get');
}

exports.create=function(req,res)
{
	var db=req.app.db;
	var col=null;
	var form=req.body;
	var gid=form['gid'];

	if (typeof(form)!=='object')
		throw "Invalid request";

	form['data']=JSON.parse(form['data']);

	console.log('form create',gid);

	step(
		function getCollection(){
			db.collection('form',this);
			console.log(arguments.callee);
		},
		function generateUniqueId(err,collection){
			if (err) throw err;
			col=collection;
			db.uniqueId(collection,'id',this);
			console.log(arguments.callee);
		},

		function setId(err,uniqueId){
			if (err) throw err;

			form['id']=uniqueId;
			form['created_on']=(new Date()).valueOf();
			console.log(arguments.callee);

			return form;
		},

		//S1 and S2 are mutually exclusive. 'gid' is used as guard.
		function S1_generateGroupId(err){
			if (err) throw err;		//handle errors
			if (gid!='0') return null;  //does the form have a group already?

			db.uniqueId(col,'id',this);
			console.log(arguments.callee);
		},

		function S1_setGroup(err,uniqueId){
			if (err) throw err;
			if (gid!='0') return null;

			form['gid']=uniqueId;
			form['group']=form['title'];
			console.log(arguments.callee);
			return form;
		},

		function S2_findGroup(err){
			if (err) throw err;
			if (gid=='0') return null;

			col.findOne({'gid':gid},this);
			console.log(arguments.callee);
		},

		function S2_updateGroup(err,result){
			if (err) throw err;
			if (gid=='0') return null;

			if (!result)
				throw Error('Group id '+gid+' not found.');

			form['group']=result['group'];
			console.log(arguments.callee);
			return form;
		},

		function addForm(err){
			if (err) throw err;

			col.insert(form,{safe:true,fsync:true},this);
			console.log(arguments.callee);
		},

		function processResult(err,result) {
			if (err) throw err; //TODO: can't let DB errors get to the client

			delete form['_id']; //remove internal ID
			res.send(form);
			console.log(arguments.callee);
		}
	);
}

/** UPDATE
 */
exports.update=function(req,res)
{
    var db=req.app.db;
    var col=null;
    var form=req.body;
    var form_id=req.params.id;

    if (typeof(form)!=='object')
        throw 'Invalid request';

    //TODO: validate input data (malicious js functions?)

    step(
        function getCollection(){
            db.collection('form',this);
        },

        function getExistingForm(err,collection){
            if (err) throw err;

            col=collection;
            col.findOne({'id':form_id},this);
        },

        function updateForm(err,item){
            if (err) throw err;

            if (!item)
                return res.send('Form not found',404);

            //unset server generated fields
            delete form['_id'];
            delete form['id'];
            delete form['created_on'];

            //perform db update
            col.update({'id':form_id},{'$set':form},{safe:true,fsync:true},this);
        },

        function processResult(err,result) {
            if (err) throw err;

            delete form['_id'];

            //send server version back to client
            res.send(form);
        }
    );
}

exports.remove=function(req,res)
{
	res.send('Form::remove');
}
