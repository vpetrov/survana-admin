define([
			'jquery',
			'underscore',
			'backbone',
			'models/form',
			'views/alert',
			'errors'
		],
function($,_,Backbone,Form,Alert,Errors)
{
    return Backbone.View.extend({
    	template:_.template($('#tpl-form-create').html()),
    	
    	initialize:function(){
    		console.log('Initializing Create Form View');
    		
    		_.bindAll(this,'onSubmit','onSubmitError','onValidationError');
    	},
    	
    	events:{
    		'submit #create-form': 'onSubmit'
    	},
    	
    	render:function()
    	{
    		$(this.el).html(this.template());
	        
    		return this;
	    },
	    
	    onSubmit:function(e)
	    {
	    	console.log('on form create submit');
                
            var data={};
            
            //copy all form values into the study object
            _.each($(e.currentTarget).serializeArray(),function(item,i){
                data[item.name]=item.value;
            });

            try{   
	            var form=new Form(data);

	            form.save({},{
	            	'wait':true,
	                'success':function(model,updates)
	                {
	                    model.set(updates,{silent:true});
	                    App.forms.add(model); //TODO: change App.forms to something appropriate
	                    
	                    App.router.navigate('create/study',{'trigger':true}); //TODO: change App.router to something more appropriate
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
	    	Errors.onSubmitError(this,model,result,caller);
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