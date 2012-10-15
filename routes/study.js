var async=require('async');
var ursa=require('ursa');
var crypto=require('crypto');
var request=require('request');

//an option object for use with mongodb. it prevents the db from returning sensitive information.
var study_blacklist={
    '_id':0,
    'keys':0
};

function getPublisher(config,p)
{
    if (config.publishers.hasOwnProperty(p))
    {
        return {
            "name":p,
            "url":config.publishers[p]
        };
    }
    else
    {
        //assign first returned server
        for (var i in config.publishers)
            return {
                "name":i,
                "url":config.publishers[i]
            }
    }

    return null;
}

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
exports.create=function(req,res,next)
{
	var db=req.app.db;
    var config=req.app.config;
	var col=null;
	var study=req.body;

	if (typeof(study)!=='object')
        return next(Error('Invalid request'));

	async.waterfall([
		function getCollection(next){
			db.collection('study',next);
		},

		function generateUniqueId(collection,next){
			col=collection;
			db.uniqueId(collection,'id',next);
		},

		function addStudy(uniqueId,next){
			study['id']=uniqueId;
			study['created_on']=(new Date()).valueOf();
            study['keys']=exports.genkeys(study,config.encryption);

			col.insert(study,{safe:true,fsync:true},next);
		},

        function prepareResult(ok,result,next)
        {
            if (!ok)
                next(result.err);

            //always return what is actually stored in the DB, not what we think was stored.
            col.findOne({'id':study.id},study_blacklist,next);
        }
    ],

    function processResult(err,study)
    {
        if (err)
            return next(err);

        res.send(study);
    });
}

/** UPDATE
 */
exports.update=function(req,res,next)
{
	var db=req.app.db;
    var config=req.app.config;
	var col=null;
	var study=req.body;
	var study_id=req.params.id;
    var publish=false;

	if (typeof(study)!=='object')
        next(Error("Invalid request"));

	//TODO: validate input data (malicious js functions?)

	async.waterfall([
		function getCollection(next){
			db.collection('study',next);
		},

		function getExistingStudy(collection,next){
			col=collection;
			col.findOne({'id':study_id},next);
		},

		function prepareStudy(item,next){
            //todo: figure out how to pass 404 to the default error handler
			if (!item)
				return res.send('Study not found',404);

			//unset server generated fields
			delete study['_id'];
			delete study['id'];
			delete study['created_on'];

            //check to see if the client added any new publishers
            var publish_servers=arrays.diff(study.publishers,item.publishers);

            //publish the study on the new servers, if necessary
            if (publish_servers && publish_servers.length)
            {
                var servers=[];
                //build a list of publish servers
                for (var i in publish_servers)
                {
                    var server=config.publishers[publish_servers[i]];
                    server['name']=publish_servers[i];
                    servers.push(server);
                }

                study.publishers=item.publishers; //only the successful publishers will be added back to this list
                module.exports.publish(item,servers,req.app.privateKey,next);
            }
            else
                //simply update the study
                next(null,null);
		},

        function updateStudy(results,next)
        {
            //has the study been published somewhere?
            if (results && results.length)
            {
                //ensure some critical properties are available
                if (!study.publishers)
                {
                    study.publishers=[];
                    study.urls={};
                }
                console.log('publish result',results);

                var errors=[];

                for (var i in results)
                {
                    if (results[i].success===1)
                    {
                        //add the publisher to list of places where this study has been published
                        study.publishers.push(results[i].server);
                        //add the public URL to the study
                        study.urls[results[i].server]=results[i].url;
                    }
                    else
                        errors.push("["+results[i].server+"] "+results[i].message);
                }

                if (errors.length)
                    next(Error("Failed to publish study '"+study_id+"': "+errors.join(". ")));
            }

            //perform db update
            col.update({'id':study_id},{'$set':study},{safe:true,fsync:true},next);
        },

        function prepareResult(ok,result,next)
        {
            if (!ok)
                next(result.err);

            //always return what is actually stored in the DB, not what we think was stored.
            col.findOne({'id':study_id},study_blacklist,next);
        }
    ],

    function processResult(err,study) {
        if (err)
            return next(err);   //defer to global error handler

        //send server version back to client
        res.send(study);
    });
}

exports.remove=function(req,res)
{
	res.send('Study::remove');
}

exports.genkeys=function(study,encryption)
{
    var result=[];

    var nkeys=encryption.keys;   //number of keys to generate
    var bits=encryption.bits;    //number of bits per key

    //generate ALL the keys!
    for (var i=0;i<nkeys;++i)
    {
        var sha1=crypto.createHash("sha1");             //prepare to hash the private key to get the ID of this key
        var keypair=ursa.generatePrivateKey(bits);      //a binary representation of the keypair
        var publicKey=keypair.toPublicPem();            //extract public PEM from keypair
        var privateKey=keypair.toPrivatePem();          //extract private PEM from keypair

        result.push({
            'id':sha1.update(publicKey).digest('hex'),  //id of the key
            'bits':bits,                                //number of bits for the key
            'public':publicKey.toString(),              //the public PEM
            'private':privateKey.toString()             //the private PEM
        });
    }

    return result;
}

exports.publish=function(study,publishers,privateKey,next)
{
    //nowhere to publish?
    if (!publishers.length)
        return;

    var copies=[];

    for (var i in publishers)
    {
        copies.push({
            'publisher':publishers[i],
            'study':study,
            'privateKey':privateKey
        });
    }

    async.map(copies,publishWorker,function(err,results){
        next(null,results);
    });

}

function publishWorker(item,next)
{
    var study=item.study;
    var publisher=item.publisher;
    var privateKey=item.privateKey;

    console.log('Publishing study ',study.id,' to server: ',publisher.name," with URL",publisher.url);

    //remove all private keys from the study object
    for (var i in study.keys)
        study.keys[i].privateKey=null;

    console.log('signature',privateKey.hashAndSign('sha256',JSON.stringify(study),'utf8','hex'));

    //construct the request option object
    var request_opt={
        uri:publisher.url,
        method:'POST',
        json:{
            'study':study,
            'signature':privateKey.hashAndSign('sha256',JSON.stringify(study),'utf8','hex')
        },
        encoding:'utf8'
    };

    //make an http/https request to the publisher
    request(request_opt,function(err,response,body){

        //by default, assume an error happened
        var result={
            'success':0,
            'message':err,
            'url':null,
            'server':publisher.name
        };

        //but if 50 years of network design miraculously brought the bits back over the wire, then read the public URL.
        if (!err)
        {
            try
            {
                //also, we expect the response to be in JSON format.
                var data=JSON.parse(body);

                //let's see if the server was nice and returned a meaningful status code (which it should)
                if (response.code==200)
                {
                    result['success']=1;    //bitter sweet
                    result['url']=data.url; //this lets every server designate their own (permanent) URLs for each study
                }
                else
                    result['message']=data.message; //some logical error happened, let's hope the server returned it to us

            }
            catch (e)
            {
                //if the JSON returned was invalid, this means the server responded with 200, but it might have been
                //an HTML page.
                result['message']='Invalid response received from the publishing service ('+body.length+').';
            }

        }

        //we're done!
        next(null,result);
    });
}
