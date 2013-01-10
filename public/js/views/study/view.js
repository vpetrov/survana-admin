/** public/js/views/study/view.js
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
    'models/study',
    'views/alert',
    'errors'
],
    function ($, _, Backbone, Study, Alert, Errors) {
        "use strict";

        return Backbone.View.extend({
            template: _.template($('#tpl-study-view').html()),
            formCollection: null,
            forms: [],
            publishers: [],


            initialize: function (options) {
                //WARNING: If the list contains a bad function name, this code will fail in Safari and Firefox.
                _.bindAll(this, 'render', 'publish', 'onPublishClick', 'onEditClick',
                                'onForkClick');

                //TODO: fetch study from the server (back button issue)
                if (!this.model) {
                    Alert.modal('This study does not exist.');
                    return;
                }

                this.formCollection = options.forms;
                this.publishers = options.publishers;

                this.model.on('change', this.render);
            },

            events: {
                'click .btn-study-publish': 'onPublishClick',
                'click .btn-study-edit': 'onEditClick',
                'click .btn-study-fork': 'onForkClick'
            },

            render: function () {
                console.log('rendering study view');
                var model = this.model.toJSON();

                this.forms = [];

                //find all form models by the ID specified in the Study (convert model to json)
                _.each(this.model.get('forms'), function (form_id) {
                    var f = this.formCollection.get(form_id);

                    if (f) {
                        console.log('found study form ' + form_id, f.toJSON());
                        this.forms.push(f.toJSON());
                    }
                }, this);

                model.forms = this.forms;

                $(this.el).html(this.template({
                    'study': model,
                    'publishers': this.publishers
                }));

                return this;
            },

            onShow: function () {
                this.delegateEvents();
                $(this.el).find("[rel=tooltip]").tooltip();
            },

            enablePublishButton: function (enable) {
                if (enable === undefined || enable) {
                    this.$el.find('button.btn-study-publish,button.dropdown-toggle').button('reset');
                } else {
                    this.$el.find('button.btn-study-publish').button('loading');
                    this.$el.find('button.dropdown-toggle').attr('disabled', 'disabled');
                }
            },

            publish: function (server) {
                var view = this,
                    publishers = this.model.get('publishers');

                //for some reason, we're trying to publish an already published study
                if (publishers.indexOf(server) > -1) {
                    return;
                }

                //user wants to publish to all servers
                if (server) {
                    //add server to current list of publishers
                    publishers.push(server);
                } else {
                    publishers = this.publishers;
                }

                this.model.save({
                    publishers: publishers
                },
                    {
                        'wait': true,
                        'success': function () {
                            //reset the button
                            view.enablePublishButton();
                        },
                        /** takes 3 params: model,result,caller (unused) */
                        'error': function (model, result) {

                            var message = "Publish error: ",
                                response;

                            try {
                                response = JSON.parse(result.responseText);

                                if (response.message) {
                                    message += response.message;
                                }
                            } catch (e) {
                                //todo: not sure what to do when the response is not valid JSON.
                                if (result.responseText && result.responseText.length) {
                                    message += result.responseText + ": ".e.message;
                                } else {
                                    message += "The server has encountered an internal error: " + e.message;
                                }
                            }

                            //remove the publisher since the request failed (doesn't trigger a 'change' event)
                            model.set({'publishers': _.without(model.get('publishers'), server)}, {'silent': true});

                            view.enablePublishButton();

                            Alert.show(message);
                        }
                    });
            },

            fork: function () {
                var newmodel = new Study(),
                    data = this.model.toJSON(),
                    router = this.router,
                    studies = this.collection,
                    el = this.$el;

                //remove properties that shouldn't be present in a fork of the current study
                delete data.id;
                delete data.created_on;
                delete data.publishers;
                delete data.urls;

                try {
                    newmodel.save(data, {
                        'wait': true,
                        'success': function (model, updates) {
                            model.set(updates, {silent: true});
                            studies.add(model);

                            el.find('#btn-study-fork').button('reset');

                            router.navigate('study/' + model.get('id'), {'trigger': true});
                        },
                        'error': this.onSubmitError
                    });
                } catch (err) {
                    console.error(err, err.message);
                }
            },

            onPublishClick: function (e) {
                //close the menu if the menu was used to publish the study
                if ($(e.currentTarget).attr('href')) {
                    $(e.currentTarget).parentsUntil('div.btn-group', 'ul').prev().dropdown('toggle');
                }

                //disable the publish button
                this.enablePublishButton(false);

                this.publish($(e.currentTarget).attr('data-publisher'));

                e.preventDefault();
                return false;
            },


            onEditClick: function (e) {
                this.router.navigate('study/' + this.model.get('id') + '/edit', {trigger: true});
                e.preventDefault();
                return false;
            },

            onForkClick: function (e) {

                this.$el.find('#btn-study-fork').attr('disabled', 'disabled');

                this.fork();

                e.preventDefault();
                return false;
            },

            onSubmitError: function (model, result, caller) {
                Errors.onSubmit(this, model, result, caller);
            }
        });

    }); //define
