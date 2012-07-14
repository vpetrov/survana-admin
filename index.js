var prefix='admin';

/** Load module.
 * @param {Object} mconf Module configuration
 */
exports.load=function(mconf)
{
	this.config=mconf;
}

exports.run=function()
{
	console.log('Starting module '+prefix+' on port '+this.config.port);
}
