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
    	template:_.template($('#tpl-form-edit').html()),
    	editor:null,

    	initialize:function(options){
    		console.log('Initializing Edit Form View',options);

    		_.bindAll(this,'submit','onCancelClick','onSaveClick','onSubmitError','onValidationError');
    	},

    	events:{
            'click  #btn-form-edit-save':    'onSaveClick',
            'click  #btn-form-edit-cancel':  'onCancelClick',
    		'submit #edit-form':             'submit'
    	},

    	render:function()
    	{
    		$(this.el).html(this.template(this.model.toJSON()));

    		if (!this.editor)
    		{
    			this.editor=new Editor({
                    text:JSON.stringify(this.model.get('data'),null,4)
                });

    			this.editor.render();
    			this.$el.find('#code-editor-container').html(this.editor.el);
    		}

    		return this;
	    },

        onSaveClick:function(e)
        {
            this.submit();

            e.preventDefault();
            return false;
        },

        onCancelClick:function(e)
        {

            window.history.back();
            e.preventDefault();
            return false;
        },

	    submit:function()
	    {
	    	console.log('on form edit submit');

            var data={};
            var forms=this.collection;
            var router=this.router;
            var form=this.$el.find('form');

            //copy all form values into the study object
            _.each(form.serializeArray(),function(item,i){
                data[item.name]=item.value;
            });

            //try to validate the JSON object
            try
            {
                //copy the document text
                data['data']=JSON.parse(this.editor.getText());
            }
            catch (err)
            {
                this.onValidationError({
                    'data':'Invalid JSON object'
                });
                return false;
            }

            try{
	            this.model.save(data,{
	            	'wait':true,
	                'success':function(model,updates)
	                {
	                    model.set(updates,{silent:true});

	                    router.navigate('form/'+model.get('id'),{'trigger':true});
	                },

	                'error':this.onSubmitError
	            });
			}
			catch (err)
			{
				console.error(err,err.message);
			}

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
