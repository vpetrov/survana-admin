define([
			'jquery',
			'underscore',
			'backbone',
			'models/study',
			'views/form/group',
			'views/study/forms',
			'views/alert',
			'errors'
		],
function($,_,Backbone,Study,FormGroupView,StudyFormsView,Alert,Errors)
{
    return Backbone.View.extend({
    	template:_.template($('#tpl-study-create').html()),
    	
    	formGroupView:null,
    	studyFormsView:null,
    	
    	initialize:function(col){
    		console.log('Initializing Create Study View',col);
    		
    		this.collection=col;

    		_.bindAll(this, 'onSubmit', 'onSubmitError', 'onValidationError')
    		
	        //left menu view
	        this.formGroupView=new FormGroupView(col); //TODO: used to be App.forms
	
	        //drop zone view
	        this.studyFormsView=new StudyFormsView(col); //TODO: used to be App.forms
	        
	        //connect the two views
	        this.formGroupView.click(this.studyFormsView.insert);
    	},
    	
    	events:{
    		'submit #create-study': 'onSubmit'
    	},
    	
    	render:function()
    	{
    	 	this.formGroupView.render();
    	 	this.studyFormsView.render();
    	 	
    		$(this.el).html(this.template());
    		
    		$(this.el).find('#sidebar-form-groups').html(this.formGroupView.el);
    		$(this.el).find('#study-forms-container').html(this.studyFormsView.el);
    		
    		console.log('form element',$(this.el).find('#create-study'));
	        
    		return this;
	    },
	    
	    onSubmit:function(e)
	    {
	    	console.log('on study create submit');
            var forms=this.studyFormsView.getForms();

            if (!forms.length)
            {
                Alert.show("Please add at least 1 form to the study before proceeding.");
                e.preventDefault();
                return false;
           }
                
            var data={};
            
            //copy all form values into the study object
            _.each($(e.currentTarget).serializeArray(),function(item,i){
                data[item.name]=item.value;
            });
            
            data['forms']=_.map(forms,function(item){
                return item.id;
            });
            
            try{   
	            var study=new Study(data);

	            study.save({},{
	            	'wait':true,
	                'success':function(model,updates){
	                    model.set(updates,{silent:true});
	                    App.studies.add(model); //TODO: change App.studies to something more appropriate

	                    App.router.navigate('study/'+model.get('id'),{'trigger':true}); //change App.router to something more appropriate
	                },
	                'error':this.onSubmitError
	            });                
			}
			catch (err)
			{
				console.error(err,err.message);
			}

        	//prevent the browser from changing the page
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