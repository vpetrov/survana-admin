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
    	
    	initialize:function(conf){
    		console.log('Initializing Study List View',arguments);
	
    		_.bindAll(this,'render','setCollection','onStudyAdded');
    		
    		console.log('my col',this.collection);
    	},
    	
    	events:{
    	},
    	
    	render:function()
    	{
    		$(this.el).html(this.template({
    			'items':this.collection.toJSON(),
    			'itemTemplate':this.itemTemplate
    		}));
	        
    		return this;
	    },
	    
	    setCollection:function(col)
	    {
    		this.collection=col;

    		if (this.collection)
    		{
    			console.log(this.collection);
    			this.collection.on("change reset",this.render);
    			this.collection.on("add",this.onStudyAdded)
    		}
	    },
	    
	    onStudyAdded:function(newitem,model)
	    {
	    	this.$el.find('tbody').append(this.itemTemplate(newitem.toJSON()));
	    }
   });
    
}); //define