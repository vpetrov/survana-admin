/** public/js/errors.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var HTTP_BAD_REQUEST = 400,
    HTTP_UNAUTHORIZED = 401,
    HTTP_SUCCESS = 200,
    HTTP_SERVER_ERROR = 500;

define([
    'jquery',
    'views/alert'
],
    function ($, Alert) {
        "use strict";

        return {

            expiredSession: function (err) {
                Alert.ask('Please proceed to the login page.', 'Your session has expired', { 'Login': 1 },
                    function (button) {
                        if (button === 'Login') {
                            window.location.reload();
                        }
                });
            },

            /** view,model,result,caller(unused) */
            onSubmit: function (view, model, result) {

                //if the result is not jqXHR, then it is a validation error
                if (result.readyState === undefined) {
                    return view.onValidationError(model, result);
                }

                //RESTful Web Services, page 372
                switch (result.status) {

                case HTTP_UNAUTHORIZED:
                    return this.expiredSession(result);

                //problem on the client
                case HTTP_BAD_REQUEST:
                    var data = null;

                    try {
                        data = $.parseJSON(result.responseText);
                    } catch (err) {
                        return Alert.show('The server was unable to validate your request. "+' +
                            '             "Please try again in a moment. (' + err.message + ')');
                    }

                    //tell the view to render the errors returned by the server
                    view.onValidationError(model, data);

                    break;

                //a serious problem on the server, which leaked to the client
                case HTTP_SUCCESS:

                //problem on the server
                case HTTP_SERVER_ERROR:
                    Alert.show('The server has experienced an internal error. Please try again later.', 'Server error');
                    break;
                default: //delegate to some global error handling function
                    break;
                }

                return true;
            }
        };

    }); //define
