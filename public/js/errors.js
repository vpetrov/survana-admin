define([
			'jquery',
			'views/alert'
		],
function($,Alert)
{
	return {
	    onSubmit:function(view,model,result,caller)
 	    {
 	    	console.log('Errors.onSubmit',arguments);
	      	//if the result is not jqXHR, then it is a validation error
	        if (typeof(result['readyState'])==='undefined')
	        	return view.onValidationError(model,result);
	
			//RESTful Web Services, page 372
			switch (result.status)
			{
				case 400: //problem on the client
						var data=null;
						
						try
						{
							data=$.parseJSON(result.responseText);
						}
						catch (err)
						{
							return Alert.show('The server was unable to validate your request. Please try again in a moment.');
						}
	
						//tell the view to render the errors returned by the server
						view.onValidationError(model,data);
	
						break;
				case 200: //a serious problem on the server, which leaked to the client (making the contents invalid)	
				case 500: //problem on the server 
						Alert.show('The server has experienced an internal error. Please try again later.','Server error')
						break;
				default: //delegate to some global error handling function
						break;
			}
		}
	}

}); //define