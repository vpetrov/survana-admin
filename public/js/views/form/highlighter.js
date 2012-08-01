define(
		[
			'jquery',
			'underscore',
			'backbone',
            'ace/ext/static_highlight',
            'ace/mode/json',
            'ace/theme/chrome'
		],
function ($,_,Backbone,AceHighlighter,AceMode,AceTheme)
{
	return Backbone.View.extend({

        highlighter:AceHighlighter,
        text:"",
		initialize:function(options)
		{
			console.log('Initializing Highlighter View',options);
            this.text=options.text;
			_.bindAll(this,'render','getHighlighter','getText');
		},

		render:function()
		{
			var result=this.highlighter.render(this.text,new AceMode.Mode(),AceTheme);
            this.$el.html('<style type="text/css"></style><div></div>');
            this.$el.children('style').html(result.css);
            this.$el.children('div').html(result.html);
            //hide the ugly border
            this.$el.find('div.ace_editor').css('border','none')

			return this;
		},

        getText:function()
        {
            return this.highlighter;
        },

        getText:function()
        {
            return this.text;
        }
	});
});
