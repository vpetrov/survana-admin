define([
			'jquery',
			'underscore',
			'backbone'
		],
function($,_,Backbone)
{
    return Backbone.View.extend({
    	template:_.template($('#tpl-study-list').html()),
    	itemTemplate:_.template($('#tpl-study-list-item').html()),

    	initialize:function(options){	
    		_.bindAll(this,'render','onStudyAdded');
    		
			this.collection.on("change reset",this.render);
			this.collection.on("add",this.onStudyAdded)
    	},

    	events:{
    	},

    	render:function()
    	{
    		console.log('study items',this.collection.toJSON());
    		$(this.el).html(this.template({
    			'items':this.collection.toJSON(),
    			'itemTemplate':this.itemTemplate
    		}));
	        
    		return this;
	    },

	    onStudyAdded:function(newitem,model)
	    {
	    	this.$el.find('tbody').append(this.itemTemplate(newitem.toJSON()));
	    }
   });
    
}); //define