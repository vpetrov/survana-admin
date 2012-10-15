var async=require('async');

exports.list=function(req,res)
{
	res.send('Form::list');
}

exports.get=function(req,res)
{
	res.send('Form::get');
}

exports.create=function(req,res,next)
{
	var db=req.app.db;
	var col=null;
	var form=req.body;
	var gid=form['gid'];

	if (typeof(form)!=='object')
		throw "Invalid request";

	form['data']=JSON.parse(form['data']);

	console.log('form create',gid);

	async.waterfall([

		function getCollection(next2){
			db.collection('form',next2);
		},
		function generateUniqueId(collection,next2){
			col=collection;
			db.uniqueId(collection,'id',next2);
		},

		function setId(uniqueId,next2){
			form['id']=uniqueId;
			form['created_on']=(new Date()).valueOf();

			next2(null,form);
		},

		//S1 and S2 are mutually exclusive. 'gid' is used as guard.
		function S1_generateGroupId(form,next2){
			if (gid!='0')
                return next2(null,form);  //does the form have a group already?

			db.uniqueId(col,'id',next2);
		},

		function S1_setGroup(uniqueId,next2){
			if (gid!='0')
                return next2(null,form);

			form['gid']=uniqueId;
			form['group']=form['title'];

            next2(null,form);
		},

		function S2_findGroup(form,next2){
			if (gid=='0')
                return next2(null,form);

			col.findOne({'gid':gid},next2);
		},

		function S2_updateGroup(result,next2){
			if (gid=='0')
                return next2(null,form);

			if (!result)
				return next2(Error('Group id '+gid+' not found.'));

			form['group']=result['group'];

			next2(null,form);
		},

		function addForm(form,next2){
			col.insert(form,{safe:true,fsync:true},next2);
		}
    ],

    function processResult(err,result) {
        if (err)
            return next(err);

        delete form['_id']; //remove internal ID
        res.send(form);
    });
}

/** UPDATE
 */
exports.update=function(req,res)
{
    var db=req.app.db;
    var form=req.body;
    var form_id=req.params.id;
    var col=null;

    if (typeof(form)!=='object')
        throw 'Invalid request';

    //TODO: validate input data (malicious js functions?)

    async.waterfall([
        function getCollection(next){
            db.collection('form',next);
        },

        function getExistingForm(collection,next){
            col=collection;
            col.findOne({'id':form_id},next);
        },

        function updateForm(item,next){
            if (!item)
                return res.send('Form not found',404);

            //unset server generated fields
            delete form['_id'];
            delete form['id'];
            delete form['created_on'];

            //perform db update
            col.update({'id':form_id},{'$set':form},{safe:true,fsync:true},next);
        }
    ],
    function processResult(err,result) {
        if (err) throw err;

        delete form['_id'];

        //send server version back to client
        res.send(form);
    });
}

exports.remove=function(req,res)
{
	res.send('Form::remove');
}
