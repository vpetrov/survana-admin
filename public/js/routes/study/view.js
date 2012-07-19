define([
			'jquery',
			'underscore',
			'views/study/view'
		],
function($,_,ViewStudyView)
{
	return function(sid,options)
	{
		var store=options.store;
		
		console.log('view_study',options);
		
		if (!this.cache)
			this.cache=[];
			
		if (!_.has(this.cache,sid))
		{
			this.cache[sid]=new ViewStudyView({
				collection:store.forms,
				model:store.studies.get(sid)
			});
			this.cache[sid].render();
		}
		else
			this.cache[sid].delegateEvents();
			
		$('#content').html(this.cache[sid].el);
	}
});