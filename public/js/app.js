define([
			'jquery',
			'backbone',
			'models/form/list',
			'models/study/list',
			'routes'
		],
function($,Backbone,FormList,StudyList,Routes)
{
		console.log('app',StudyList);
	    //Init all models
	    var forms=new FormList();
	    var studies=new StudyList(); //TODO: pass studies to HomeView
	    
	    //init models
	    forms.reset($.parseJSON($('#store-forms').html()));
	    studies.reset($.parseJSON($('#store-studies').html()));   
	
	    var routes=new Routes();
	    console.log(routes);
	    Backbone.history.start();
}); //define