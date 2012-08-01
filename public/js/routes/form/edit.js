define([
			'jquery',
			'underscore',
			'views/form/edit'
		],
function($,_,EditFormView)
{
	return function(fid,options)
	{
		var store=options.store;

		console.log('edit_form',options);

		if (!this.cache)
			this.cache=[];

        console.log('cache fid',this.cache[fid]);

        if (!_.has(this.cache,fid))
		{
			this.cache[fid]=new EditFormView({
				collection:store.forms,
				model:store.forms.get(fid)
			});
			this.cache[fid].render();
		}
		else
        {
            console.log('restoring view from cache',this.cache[fid]);
            this.cache[fid].delegateEvents();
        }


		$('#content').html(this.cache[fid].el);
	}
});
