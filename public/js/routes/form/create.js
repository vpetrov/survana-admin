define([
			'jquery',
			'views/form/create'
		],
function($,CreateFormView)
{
	return function()
	{
		console.log('create_form');
		
		this.createFormView=new CreateFormView();
		this.createFormView.render();
		
		$('#content').html(this.createFormView.el);
		
		//TODO: Update navigation
	};
	
}); //define