var step=require('step');

exports.list=function(req,res)
{
	res.send('Study::list');
}

exports.get=function(req,res)
{
	res.send('Study::get');
}

/** CREATE
 * 
 * @param {Object} req
 * @param {Object} res
 */
exports.create=function(req,res)
{	
	var db=req.app.db;
	var col=null;
	var study=req.body;
	
	if (typeof(study)!=='object')
		throw "Invalid request";
	
	step(
		function getCollection(){
			db.collection('study',this);
		},
		
		function generateUniqueId(err,collection){
			if (err) throw err;
			col=collection;
			db.uniqueId(collection,'id',this);
		},
		
		function addStudy(err,uniqueId){
			if (err) throw err;

			study['id']=uniqueId;
			study['created_on']=(new Date()).valueOf();
			
			col.insert(study,{safe:true,fsync:true},this);
		},
		
		function processResult(err,result) {
			if (err) throw err; //TODO: can't let DB errors get to the client
			
			delete study['_id']; //remove internal ID
			res.send(study);
		}
	);
}

/** UPDATE
 */
exports.update=function(req,res)
{
	var db=req.app.db;
	var col=null;
	var study=req.body;
	var study_id=req.params.id;
	
	if (typeof(study)!=='object')
		throw 'Invalid request';
		
	//TODO: validate input data (malicious js functions?) 
		
	step(
		function getCollection(){
			db.collection('study',this);
		},
		
		function getExistingStudy(err,collection){
			if (err) throw err;
			
			col=collection;
			col.findOne({'id':study_id},this);
		},
		
		function updateStudy(err,item){
			if (err) throw err;
			
			if (!item)
				return res.send('Study not found',404);
				
			//unset server generated fields
			delete study['_id'];
			delete study['id'];
			delete study['created_on'];
			
			//perform db update
			col.update({'id':study_id},{'$set':study},{safe:true,fsync:true},this);
		},
		
		function processResult(err,result) {
			if (err) throw err;
			
			delete study['_id'];
			
			//send server version back to client
			res.send(study);
		}
	);
}

exports.remove=function(req,res)
{
	res.send('Study::remove');
}
