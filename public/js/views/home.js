define([
			'jquery',
			'underscore',
			'backbone',
			'views/study/list'
		],
function($,_,Backbone,StudyListView)
{
    return Backbone.View.extend({
    	template:_.template($('#tpl-home').html()),
    	welcomeTemplate:_.template($('#tpl-welcome').html()),
    	studyListView:null,
    	
    	initialize:function(){
    		console.log('Initializing Home View',this.collection);
    		
    		this.studyListView=new StudyListView({
    			collection:this.collection
			});
    	},
    	
    	events:{
    		//event listeners go here
    	},
    	
    	render:function(){
    		$(this.el).html(this.template());
    		this.studyListView.render();
    		//display a list of all studies
    		if (this.collection && this.collection.length)
    			$(this.el).find('#main-content').html(this.studyListView.el);
    		else
    		//display a welcome page
    			$(this.el).find('#main-content').html(this.welcomeTemplate());
    		return this;
    	},
    });

}); //define