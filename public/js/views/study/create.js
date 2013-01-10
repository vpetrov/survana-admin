/** public/js/views/study/create.js
 *
 * TODO: Merge with edit.js
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
            optionsTemplate: _.template($('#tpl-form-options').html()),

            formGroupView: null,
            studyFormsView: null,

            overrides: [],

            initialize: function (options) {
                console.log('Initializing Create Study View', options);

                _.bindAll(this, 'onSubmit', 'onShow', 'onSubmitError', 'onValidationError',
                                'onFormMenuOptionsClick', 'onFormOptionsSave', 'onFormIndexChanged');

                //left menu view
                this.formGroupView = new FormGroupView({
                    collection: options.forms
                });

                //drop zone view
                this.studyFormsView = new StudyFormsView({
                    collection: options.forms
                });
            },

            events: {
                'submit form': 'onSubmit',
                'click  a.form-menu-options':   'onFormMenuOptionsClick'
            },

            render: function () {
                this.formGroupView.render();
                this.studyFormsView.render();

                $(this.el).html(this.template());

                $(this.el).find('.sidebar-form-groups').html(this.formGroupView.el);
                $(this.el).find('.study-forms-container').html(this.studyFormsView.el);

                return this;
            },

            onShow: function () {
                this.formGroupView.onShow();
                this.studyFormsView.onShow();

                this.formGroupView.on('formclick', this.studyFormsView.insert);
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

                data.overrides = this.overrides;

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
            },

            onFormMenuOptionsClick: function (e) {
                var data,
                    index = $(e.currentTarget).parentsUntil(this.el, 'li.active').index(); //order in the form list

                data = {
                    'index': index,
                    'options': this.overrides[index]
                };

                Alert.form(this.optionsTemplate(data), "Form Options", this.onFormOptionsSave);

                e.preventDefault();
                return false;
            },

            /** Callback from a modal form.
             * @param data The form data
             * @return {Boolean} True to close the modal form, False to keep it open
             */
            onFormOptionsSave: function (data) {
                var index = null,
                    options = {};

                if (!data || !data.length) {
                    return false;
                }

                //copy the data from the array into an object
                _.each(data, function (item) {
                    if (item.name === '_index') {
                        index = item.value;
                        return;
                    }

                    if (item.value.toString().length) {
                        options[item.name] = item.value;
                    }
                });

                if (index !== null) {
                    this.overrides[index] = options;
                }

                return true;
            },

            /** Handler for when the FormGroupView detects that the user has reordered the forms
             * @param from  Source index
             * @param to    Destination index
             */
            onFormIndexChanged: function (from, to) {
                var item;

                if (from === to) {
                    return;
                }

                //swap study overrides
                item = this.overrides[from];

                this.overrides.splice(from, 1);

                //make sure the array has enough elements up to the 'to' position
                while (this.overrides.length < to) {
                    this.overrides.push(null);
                }

                this.overrides.splice(to, 0, item);
            }
        });

    }); //define
