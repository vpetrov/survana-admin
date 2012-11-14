/** public/js/views/form/edit.js
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
    'models/form',
    'views/alert',
    'errors',
    'views/form/editor'
],
    function ($, _, Backbone, Form, Alert, Errors, Editor) {
        "use strict";

        return Backbone.View.extend({
            template: _.template($('#tpl-form-edit').html()),
            editor: null,

            initialize: function (options) {
                console.log('Initializing Edit Form View', options);

                _.bindAll(this, 'submit', 'onCancelClick', 'onSaveClick', 'onSubmitError', 'onValidationError');
            },

            events: {
                'click  #btn-form-edit-save': 'onSaveClick',
                'click  #btn-form-edit-cancel': 'onCancelClick',
                'submit #edit-form': 'submit'
            },

            render: function () {
                $(this.el).html(this.template(this.model.toJSON()));

                if (!this.editor) {
                    this.editor = new Editor({
                        text: JSON.stringify(this.model.get('data'), null, 4)
                    });

                    this.editor.render();
                    this.$el.find('#code-editor-container').html(this.editor.el);
                }

                return this;
            },

            onSaveClick: function (e) {
                this.submit();

                e.preventDefault();
                return false;
            },

            onCancelClick: function (e) {

                window.history.back();
                e.preventDefault();
                return false;
            },

            submit: function () {

                var data = {},
                    router = this.router,
                    form = this.$el.find('form');

                //copy all form values into the study object

                _.each(form.serializeArray(), function (item) {
                    data[item.name] = item.value;
                });

                //try to validate the JSON object
                try {
                    //copy the document text
                    data.data = JSON.parse(this.editor.getText());
                } catch (e1) {
                    this.onValidationError({
                        'data': 'Invalid JSON object'
                    }, [e1]);
                    return false;
                }

                try {
                    this.model.save(data, {
                        'wait': true,
                        'success': function (model, updates) {
                            model.set(updates, {silent: true});

                            router.navigate('form/' + model.get('id'), {'trigger': true});
                        },

                        'error': this.onSubmitError
                    });
                } catch (e2) {
                    Alert.show(e2.message);
                }

                return false;
            },

            onSubmitError: function (model, result, caller) {
                Errors.onSubmit(this, model, result, caller);
            },

            onValidationError: function (model, errors) {
                var msg = "",
                    e;

                for (e in errors) {
                    if (errors.hasOwnProperty(e)) {
                        msg += errors[e] + "\n";
                    }
                }

                if (!msg.length) {
                    msg = "We were unable to validate your input data. Please try again.";
                }

                Alert.show(msg);
            }
        });

    }); //define
