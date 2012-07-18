define([
			'jquery',
			'views/study/view'
		],
function($,ViewStudyView)
{
	return function(sid)
	{
		console.log('view_study');
		if (!this.cache)
			this.cache=[];
			
		if (!_.has(this.cache,sid))
		{
			this.cache[sid]=new ViewStudyView({
				model:App.studies.get(sid) //TODO: replace with something else
			});
			this.cache[sid].render();
		}
		else
			this.cache[sid].delegateEvents();
			
		$('#content').html(this.cache[sid].el);
	}
});