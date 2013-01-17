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
            statusTemplate: _.template($('#tpl-code-editor-message').html()),
            editor: null,
            saving: false,

            initialize: function (options) {
                console.log('Initializing Edit Form View', options);

                _.bindAll(this, 'submit', 'onCancelClick', 'onSaveClick', 'onSubmitError', 'onValidationError',
                                'onShortcut', 'setSaveStatus');

                $(window).keydown($.proxy(this.onShortcut, this));
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

            preview: function () {
                var form = this.$el.find('form.preview');

                form.find('input').val(JSON.stringify(this.model.toJSON()));

                //register the submit handler
                form.submit(function () {
                    window.open('', 'formpreview');
                    this.target = 'formpreview';
                });

                //submit the form
                form.submit();
            },

            setSaveStatus: function (status, message) {
                var icon = "";

                //bootstrap icon-* value
                if (status === null) {
                    icon = 'retweet';
                } else if (status === false) {
                    icon = 'warning-sign';
                } else if (status === true) {
                    icon = 'ok-sign';
                }

                this.$el.find('.code-editor-message').html(this.statusTemplate({
                    'icon': icon,
                    'message': message
                }));
            },

            onShortcut: function (event) {

                var found = false,
                    context = this;


                if (((event.which === 115) || (event.which === 83)) && (event.ctrlKey || event.metaKey)) {  //Save
                    if (!context.saving) {
                        context.saving = true;

                        context.setSaveStatus(null, 'Saving ...');

                        this.submit(function (result) {
                            context.saving = false;
                            if (result) {
                                context.setSaveStatus(true, "Saved at " + (new Date()).toLocaleTimeString());
                            } else {
                                context.setSaveStatus(false, "Save failed");
                            }
                        });
                    }
                    found = true;

                } else if ((event.which === 80) && (event.ctrlKey || event.metaKey)) {                      //Preview
                    this.preview();
                    found = true;
                }

                if (found) {
                    event.preventDefault();
                    return false;
                }

                return true;
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

            submit: function (callback) {

                var data = {},
                    router = this.router,
                    form = this.$el.find('form.edit'),
                    context = this;

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
                            model.set(updates);

                            if (callback) {
                                callback(true, model);
                            } else {
                                router.navigate('form/' + model.get('id'), {'trigger': true});
                            }
                        },

                        'error': function () {
                            if (callback) {
                                callback.apply(context, [false]);
                            } else {
                                this.onSubmitError.apply(context, [false]);
                            }
                        }
                    });
                } catch (e2) {
                    Alert.show(e2.message);
                }

                return false;
            },

            onSubmitError: function (model, result, caller) {
                this.saving = false;
                Errors.onSubmit(this, model, result, caller);
            },

            onValidationError: function (model, errors) {
                this.saving = false;
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
