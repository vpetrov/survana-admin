/** public/js/views/user/create.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'models/user',
    'views/alert',
    'errors'
],
    function ($, _, Backbone, User, Alert, Errors) {
        "use strict";

        return Backbone.View.extend({
            template:   _.template($('#tpl-user-create').html()),

            initialize: function () {
                _.bindAll(this, 'onSubmit', 'onSubmitError', 'onValidationError');
            },

            events: {
                'submit #create-user': 'onSubmit'
            },

            render: function () {
                $(this.el).html(this.template());

                return this;
            },

            onSubmit: function (e) {
                var data    = {},
                    users   = this.collection,
                    router  = this.router,
                    user    = null;

                //copy all form values into the study object
                _.each($(e.currentTarget).serializeArray(), function (item) {
                    data[item.name] = item.value;
                });

                try {
                    user = new User(data);

                    user.save({}, {
                        'wait':     true,
                        'success':  function (model, updates) {
                            model.set(updates, {silent: true});
                            users.add(model);
                        },

                        'error': this.onSubmitError
                    });
                } catch (err) {
                    console.error(err, err.message);
                }

                e.preventDefault();
                return false;
            },

            onSubmitError: function (model, result, caller) {
                Errors.onSubmit(this, model, result, caller);
            },

            onValidationError: function (model, data) {
                Alert.show(data.message);
            }
        });

    }); //define
