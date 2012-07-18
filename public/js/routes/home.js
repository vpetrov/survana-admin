define([
			'jquery',
			'views/home',
			'models/study/list'
		],
function($,HomeView,StudyList)
{
	return function()
	{
		console.log('home');
		if (!this.homeView)
		{
			this.homeView=new HomeView({
				collection:new StudyList()
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