define([
			'backbone',
			'models/study'
		],
function(Backbone,Study)
{
    return	Backbone.Collection.extend(
			{
    			model:Study,
    			url:'studies' //TODO: change me
    		});
}); //define