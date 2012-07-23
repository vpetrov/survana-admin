define(
		[
			'jquery',
			'underscore',
			'backbone'
		],
function ($,_,Backbone)
{
	return Backbone.View.extend({
		
		initialize:function(options)
		{
			console.log('Initializing Editor View');
			_.bindAll(this,'render');
		},
		
		render:function()
		{
			this.$el.addClass('code-editor');
			console.log('code editor element',this.$el);
			var editor=ace.edit($(this.el).get(0));
    	    //editor.setTheme("ace/theme/twilight");
    		editor.getSession().setMode("ace/mode/json");
			return this;
		}
	});
});
