define([
			'backbone'
		],
function(Backbone)
{
    var result=Backbone.Model.extend(
	{
    	urlRoot:'study',
    	defaults:function(){
    		return {
    			created_on:0,
    			title:"",
    			published:false,
                install:true,
    			forms:[]
    		}
    	},

        initialize:function(){
            if (!this.get("title")){
                this.set({
                	'created_on':this.defaults.created_on,
                	'title':this.defaults.title,
                	'published':this.defaults.published,
                    'install':true,
                	'forms':this.defaults.forms
                });
            }
        },

        validate:function(attr)
        {
        	var result={};
        	var e=0;

        	if (!attr.title)
        	{
        		result['title']='Please specify a title for the study';
        		e=1;
        	}

        	if (e)
        		return result;
        },

    	clear:function(){this.destroy;}
    });

	return result;

}); //define
