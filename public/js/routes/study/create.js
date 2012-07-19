define([
			'jquery',
			'views/study/create'
		],
function($,CreateStudyView)
{
	return function(options)
	{
		var store=options.store;
		console.log('create_study');
		
		this.createStudyView=new CreateStudyView({
				collection:store.studies,
				forms:store.forms
			});
		this.createStudyView.render();
			
		$('#content').html(this.createStudyView.el);
		
		//TODO: update navigation
	}

}); //define