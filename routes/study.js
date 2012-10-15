var async=require('async');
var ursa=require('ursa');
var crypto=require('crypto');
var request=require('request');

//an option object for use with mongodb. it prevents the db from returning sensitive information.
var study_blacklist={
    '_id':0,
    'keys':0
};

var form_blacklist={
    '_id':0
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
		function getCollection(next2){
			db.collection('study',next2);
		},

		function generateUniqueId(collection,next2){
			col=collection;
			db.uniqueId(collection,'id',next2);
		},

		function addStudy(uniqueId,next2){
			study['id']=uniqueId;
			study['created_on']=(new Date()).valueOf();
            study['keys']=exports.genkeys(study,config.encryption);

			col.insert(study,{safe:true,fsync:true},next2);
		},

        function prepareResult(result,next2)
        {
            //always return what is actually stored in the DB, not what we think was stored.
            col.findOne({'id':study.id},study_blacklist,next2);
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


            //skip to the next step if no publishing is necessary
            if (!publish_servers || !publish_servers.length)
                return next(null,null);


            //publish the study on the new servers, if necessary
            var servers=[];
            //build a list of publish servers
            for (var i in publish_servers)
            {
                var server=config.publishers[publish_servers[i]];
                server['name']=publish_servers[i];
                servers.push(server);
            }

            study.publishers=item.publishers; //only the successful publishers will be added back to this list

            //replace all form ids with copies of the actual form data and then publish
            //first, obtain the forms from the database
            async.waterfall([
                function getCollection(next2)
                {
                    db.collection('form',next2);
                },

                function getAllFormsInStudy(col,next2)
                {
                    col.find({
                        'id':{
                            '$in':item.forms
                        }
                    },form_blacklist).toArray(next2);
                },

                function replaceCurrentForms(forms,next2)
                {
                    if (!forms || !forms.length)
                        next2(Error('Failed to get list of forms from the database.'));

                    //have all the forms been found in the database?
                    if (forms.length!=item.forms.length)
                    {
                        //oops. some forms are missing. get their IDs then.

                        //first,build an array of IDs that were found
                        var found=[];
                        for (var i in forms)
                            found.push(forms[i].id);

                        var not_found=arrays.diff(item.forms,found);

                        return next2(Error('The following forms could not be found: '+not_found.join(',')));
                    }

                    //todo: make sure that all forms were published before publishing the study

                    var full_study=item;

                    //add all the forms in the correct order (since the array returned by mongodb might not match the
                    // order in which the user has arranged the forms)
                    for (var i in forms)
                    {
                        var form=forms[i];

                        var index=full_study.forms.indexOf(form.id);
                        full_study.forms[index]=form;
                    }

                    next2(null,full_study)
                }
            ],
            function processResult(err,full_study)
            {
                if (err)
                    return next(err);

                //make sure the internal mongodb ID is not published
                delete full_study['_id'];

                //publish the study (and then proceed to the next step)
                module.exports.publish(full_study,servers,req.app.privateKey,next);
            });
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
