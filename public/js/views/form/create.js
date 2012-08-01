define([
			'jquery',
			'underscore',
			'backbone',
			'models/form',
			'views/alert',
			'errors',
			'views/form/editor'
		],
function($,_,Backbone,Form,Alert,Errors,Editor)
{
    return Backbone.View.extend({
    	template:_.template($('#tpl-form-create').html()),
    	editor:null,

    	initialize:function(options){
    		console.log('Initializing Create Form View',options);

    		_.bindAll(this,'onSubmit','onSubmitError','onValidationError');
    	},

    	events:{
    		'submit #create-form': 'onSubmit'
    	},

    	render:function()
    	{
    		$(this.el).html(this.template());

    		if (!this.editor)
    		{
    			this.editor=new Editor();

    			this.editor.render();
    			this.$el.find('#code-editor-container').html(this.editor.el);
    		}

			console.log('editor',this.editor);
    		//console.log(Ace); //NOTE: ace.edit('editor) needs to be called after the elemnt has been attached to the DOM

    		return this;
	    },

	    onSubmit:function(e)
	    {
	    	console.log('on form create submit');

            var data={};
            var forms=this.collection;
            var router=this.router;

            //copy all form values into the study object
            _.each($(e.currentTarget).serializeArray(),function(item,i){
                data[item.name]=item.value;
            });

            //copy the document text
            data['data']=this.editor.getText();

            try{
	            var form=new Form(data);

	            form.save({},{
	            	'wait':true,
	                'success':function(model,updates)
	                {
	                    model.set(updates,{silent:true});
	                    forms.add(model);

	                    router.navigate('study/create',{'trigger':true});
	                },

	                'error':this.onSubmitError
	            });
			}
			catch (err)
			{
				console.error(err,err.message);
			}

	    	e.preventDefault();
	    	return false;
	    },

	    onSubmitError:function(model,result,caller)
	    {
	    	Errors.onSubmit(this,model,result,caller);
	    },

		onValidationError:function(model,errors)
		{
			var msg="";

			for (var e in errors)
			{
				msg+=errors[e]+"\n";
			}

			if (!msg.length)
				msg="We were unable to validate your input data. Please try again."

			Alert.show(msg);
		}
    });

}); //define
