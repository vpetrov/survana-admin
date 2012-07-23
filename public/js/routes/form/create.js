define([
			'jquery',
			'views/form/create'
		],
function($,CreateFormView)
{
	return function(options)
	{
		var store=options.store;
		
		console.log('create_form',options);
		
		this.createFormView=new CreateFormView({
			collection:store.forms
		});
		this.createFormView.render();
		
		$('#content').html(this.createFormView.el);
		
		//TODO: Update navigation
	};
	
}); //define