define([
			'backbone',
			'models/form'
		],
function(Backbone,Form)
{
	//A collection of Forms    
    var result=Backbone.Collection.extend(
    		{
        		model:Form,
    			url:'forms'
    		});
    
    return result;
}); //define