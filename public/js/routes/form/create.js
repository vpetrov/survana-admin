define([
			'jquery',
			'views/form/create'
		],
function($,CreateFormView)
{
	return function(options)
	{
		console.log('create_form',options);
		
		this.createFormView=new CreateFormView();
		this.createFormView.render();
		
		$('#content').html(this.createFormView.el);
		
		//TODO: Update navigation
	};
	
}); //define