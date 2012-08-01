define([
			'jquery',
			'backbone',
			'routes/home',
			'routes/form/create',
			'routes/study/create',
			'routes/study/view',
            'routes/form/view',
            'routes/form/edit'
		],
function($,Backbone,Home,CreateForm,CreateStudy,ViewStudy,ViewForm,EditForm)
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
			'form/create':      "create_form",
            'form/:id':         "view_form",
            'form/:id/edit':    "edit_form"
		},

        //NOTES: If these routes are not instantiated with 'new', they all share the same 'this' object

		"home": function()
				{
					console.log('routes home - passing this.store.forms',this.store.forms)
					return Home({
						store:this.store
					});
				},

		"create_form":	function()
						{
							return new CreateForm({
								store:this.store
							});
						},

		"create_study":	function()
						{
							return new CreateStudy({
								store:this.store
							});
						},
		"view_study":	function(sid)
						{
							return new ViewStudy(sid,{
								store:this.store
							});
						},
        "view_form":    function(fid)
                        {
                            return ViewForm(fid,{
                                store:this.store
                            });
                        },
        "edit_form":    function(fid)
                        {
                            return new EditForm(fid,{
                                store:this.store
                            });
                        }
    });

	return new Router();

}); //define
