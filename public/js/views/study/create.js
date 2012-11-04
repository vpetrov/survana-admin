define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap',
    'models/study',
    'views/form/group',
    'views/study/forms',
    'views/alert',
    'errors'
],
    function ($, _, Backbone, bootstrap, Study, FormGroupView, StudyFormsView, Alert, Errors) {
        "use strict";

        return Backbone.View.extend({
            template: _.template($('#tpl-study-create').html()),

            formGroupView: null,
            studyFormsView: null,

            initialize: function (options) {
                console.log('Initializing Create Study View', options);

                _.bindAll(this, 'onSubmit', 'onSubmitError', 'onValidationError');

                //left menu view
                this.formGroupView = new FormGroupView({
                    collection: options.forms
                });

                //drop zone view
                this.studyFormsView = new StudyFormsView({
                    collection: options.forms
                });

                //connect the two views
                this.formGroupView.click(this.studyFormsView.insert);
            },

            events: {
                'submit #create-study': 'onSubmit'
            },

            render: function () {
                this.formGroupView.render();
                this.studyFormsView.render();

                $(this.el).html(this.template());

                $(this.el).find('#sidebar-form-groups').html(this.formGroupView.el);
                $(this.el).find('#study-forms-container').html(this.studyFormsView.el);

                console.log('form element', $(this.el).find('#create-study'));

                return this;
            },

            onSubmit: function (e) {
                var forms = this.studyFormsView.getForms(),
                    studies = this.collection,
                    router = this.router,
                    data = {},
                    study;

                if (!forms.length) {
                    Alert.show("Please add at least 1 form to the study before proceeding.");
                    e.preventDefault();
                    return false;
                }

                //copy all form values into the study object
                _.each($(e.currentTarget).serializeArray(), function (item) {
                    data[item.name] = item.value;
                });

                data.forms = _.map(forms, function (item) {
                    return item.id;
                });

                try {
                    study = new Study(data);

                    study.save({}, {
                        'wait': true,
                        'success': function (model, updates) {
                            model.set(updates, {silent: true});
                            studies.add(model);

                            router.navigate('study/' + model.get('id'), {'trigger': true});
                        },
                        'error': this.onSubmitError
                    });
                } catch (err) {
                    console.error(err, err.message);
                }

                //prevent the browser from changing the page
                e.preventDefault();
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
