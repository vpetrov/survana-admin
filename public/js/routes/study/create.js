define([
			'jquery',
			'views/study/create'
		],
function($,CreateStudyView)
{
	return function()
	{
		console.log('create_study');
		
		this.createStudyView=new CreateStudyView();
		this.createStudyView.render();
			
		$('#content').html(this.createStudyView.el);
		
		//TODO: update navigation
	}

}); //define