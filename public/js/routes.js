define([
			'jquery',
			'backbone',
			'routes/home',
			'routes/form/create',
			'routes/study/create',
			'routes/study/view'
		],
function($,Backbone,Home,CreateForm,CreateStudy,ViewStudy)
{
	return Backbone.Router.extend({
		routes:{
			'': 				"home",
			'study/create':		"create_study",
			'study/:id':        "view_study",
			'form/create':      "create_form"
		},
		"home":			Home,
		"create_form":	CreateForm,
		"create_study":	CreateStudy,
		"view_study":	ViewStudy
	});

}); //define