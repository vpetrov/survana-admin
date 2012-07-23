define([
			'jquery',
			'backbone',
			'models/form/list',
			'models/study/list',
			'routes'
		],
function($,Backbone,FormList,StudyList,Routes)
{		 
		var store={};
	    
	    //Init all models
	    store.forms=new FormList();
	    store.studies=new StudyList(); //TODO: pass studies to HomeView
	    
	    //init models
	    store.forms.reset($.parseJSON($('#store-forms').html()));
	    store.studies.reset($.parseJSON($('#store-studies').html()));
	    
	    Routes.store=store;
	    
	    Backbone.View.prototype.router=Routes;

	    Backbone.history.start();

}); //define