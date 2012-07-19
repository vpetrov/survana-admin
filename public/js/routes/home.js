define([
			'jquery',
			'views/home',
			'models/study/list'
		],
function($,HomeView,StudyList)
{
	return function(options)
	{
		console.log('home');
		
		var store=options.store;

		if (!this.homeView)
		{
			this.homeView=new HomeView({
				collection:store.forms,
				study_collection:store.studies
			});
			this.homeView.render();
		}
		else
			this.homeView.delegateEvents();
		
		//set content	
		$('#content').html(this.homeView.el);
		
		//TODO: update navigation
	}

}); //define