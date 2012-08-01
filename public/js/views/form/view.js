define([
			'jquery',
			'underscore',
			'backbone',
			'views/alert',
            'views/form/highlighter'
		],
function($,_,Backbone,Alert,Highlighter)
{
    return Backbone.View.extend({
    	template:_.template($('#tpl-form-view').html()),
        menuTemplate:_.template($('#tpl-form-version-menu').html()),
        group:[],
        highlighter:null,

    	initialize:function(options)
    	{
    		_.bindAll(this,'render','publish','onPublishClick','onVersionClick');

    		if (!this.model)
    			return Alert.modal('This form does not exist.');

			this.model.on('change',this.render)
    	},

    	events:{
    		'click #btn-form-publish':  'onPublishClick',
            'click #btn-form-edit':     'onEditClick',
            'click ul.dropdown-menu li':'onVersionClick'
    	},

    	render:function()
    	{
    		var model=this.model.toJSON();
            group=this.collection.
                //find all forms belonging to this gid
                where({'gid':this.model.get('gid')}).
                //convert all results to JSON
                map(function(item){
                        return item.toJSON()
                    });

            //main page
			$(this.el).html(this.template(model));

            //version menu
            $(this.el).find('.form-versions').replaceWith(this.menuTemplate({
                'group':group
            }));

            //highlighter
            this.highlighter=new Highlighter({
                text:JSON.stringify(model.data,null,8)
            });
            this.highlighter.render();
            var container=this.$el.find('#code-viewer-container');

            container.html(this.highlighter.el);

            //hack to get the buttons below to render appropriately
            container.css('height',(container.find('div.ace_line').length*18)+'px');
            console.log('height',container.find('div.ace_editor'));
			return this;
    	},

    	publish:function()
    	{
    		if (this.model.get('publish'))
    			return;

    		this.model.save({
    				'published':true
    			},
    			{
    				'wait':true,
    				'success':function(){
    					console.log('success');
    				},
    				'error':function(model,result,caller){
    					console.log('no success',model,result,caller);
    				}
    			});
    	},

    	onPublishClick:function(e)
    	{
    		this.publish();

    		e.preventDefault();
    		return false;
    	},

        onEditClick:function(e)
        {
            this.router.navigate('form/'+this.model.get('id')+'/edit',{trigger:true});
            e.preventDefault();
            return false;
        },

        onVersionClick:function(e)
        {
            var target=e.currentTarget;
            var form_url='#form/'+$(target).children('a').attr('data-form-id');
            console.log(form_url);
            $(target).parents('ul.dropdown-menu').first().dropdown('toggle');
            this.router.navigate(form_url,{trigger:true});

            e.preventDefault();
            return false;
        }
    });

}); //define
