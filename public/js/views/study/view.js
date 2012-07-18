define([
			'jquery',
			'underscore',
			'backbone',
			'views/alert'
		],
function($,_,Backbone,Alert)
{
    return Backbone.View.extend({
    	template:_.template($('#tpl-study-view').html()),
    	forms:[],
    	
    	initialize:function(col)
    	{
    		this.collection=col;
    		
    		_.bindAll(this,'render','publish','onPublishClick');
    		
    		if (!this.model)
    			return Alert.modal('This study does not exist.');
    		
    		//find all form models by the ID specified in the Study (convert model to json)		
			_.each(this.model.get('forms'),function(form_id){
				var f=this.collection.get(form_id); //TODO: used to be App.forms.get
				
				if (f)
					this.forms.push(f.toJSON());
			},this);
			
			this.model.on('change',this.render)
    	},
    	
    	events:{
    		'click #btn-study-publish': 'onPublishClick'
    	},
    	
    	render:function()
    	{
    		console.log('rendering study view');
    		var model=this.model.toJSON();
    		
    		model['forms']=this.forms;
    		
			$(this.el).html(this.template(model));
			return this;    		
    	},
    	
    	publish:function()
    	{
    		if (this.model.get('publish'))
    			return;
    			
    		this.model.save({
    				'published':true
    			},
    			{
    				'wait':true,
    				'success':function(){
    					console.log('success');
    				},
    				'error':function(model,result,caller){
    					console.log('no success',model,result,caller);
    				}
    			});
    	},
    	
    	onPublishClick:function(e)
    	{
    		this.publish();
    		
    		e.preventDefault();
    		return false;
    	}
    });

}); //define