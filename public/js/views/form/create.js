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
            template:   _.template($('#tpl-form-create').html()),
            editor:     null,

            initialize: function () {
                _.bindAll(this, 'onSubmit', 'onSubmitError', 'onValidationError');
            },

            events: {
                'submit #create-form': 'onSubmit'
            },

            render: function () {
                $(this.el).html(this.template());

                if (!this.editor) {
                    this.editor = new Editor();

                    this.editor.render();

                    this.$el.find('#code-editor-container').html(this.editor.el);
                }

                return this;
            },

            onSubmit: function (e) {
                var data    = {},
                    forms   = this.collection,
                    router  = this.router,
                    form    = null;

                //copy all form values into the study object
                _.each($(e.currentTarget).serializeArray(), function (item) {
                    data[item.name] = item.value;
                });

                //copy the document text
                data.data = this.editor.getText();

                try {
                    form = new Form(data);

                    form.save({}, {
                        'wait':     true,
                        'success':  function (model, updates) {
                            model.set(updates, {silent: true});
                            forms.add(model);

                            router.navigate('study/create', {'trigger': true});
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

            onValidationError: function (model, errors) {
                var msg = "", e;

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
