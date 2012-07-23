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
	var Router=Backbone.Router.extend({
		
		store:{},
		
		initialize:function(options){
			if (options)
				this.store=options.store;
			
			console.log('router this.store',this.store);		
		},
		
		routes:{
			'': 				"home",
			'study/create':		"create_study",
			'study/:id':        "view_study",
			'form/create':      "create_form"
		},

		"home": function()
				{ 
					console.log('routes home - passing this.store.forms',this.store.forms)
					return Home({
						store:this.store
					});
				},
				
		"create_form":	function()
						{
							return CreateForm({
								store:this.store
							});
						},

		"create_study":	function()
						{
							return CreateStudy({
								store:this.store
							});
						},
		"view_study":	function(sid)
						{
							return ViewStudy(sid,{
								store:this.store
							});
						}
	});
	
	return new Router();

}); //define