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
    'views/alert'
],
    function ($, _, Backbone, Alert) {
        "use strict";

        return Backbone.View.extend({
            template: _.template($('#tpl-study-view').html()),
            forms: [],
            publishers: [],

            initialize: function (options) {
                _.bindAll(this, 'render', 'publish', 'onPublishClick', 'disablePublishButton', 'onEditClick');

                //TODO: fetch study from the server (back button issue)
                if (!this.model) {
                    Alert.modal('This study does not exist.');
                    return;
                }

                this.publishers = options.publishers;

                this.forms = [];

                //find all form models by the ID specified in the Study (convert model to json)
                _.each(this.model.get('forms'), function (form_id) {
                    var f = this.collection.get(form_id);

                    if (f) {
                        console.log('found study form ' + form_id, f.toJSON());
                        this.forms.push(f.toJSON());
                    }
                }, this);

                this.model.on('change', this.render);
            },

            events: {
                'click .btn-study-publish': 'onPublishClick',
                'click #btn-study-edit': 'onEditClick'
            },

            render: function () {
                console.log('rendering study view');
                var model = this.model.toJSON();

                model.forms = this.forms;

                $(this.el).html(this.template({
                    'study': model,
                    'publishers': this.publishers
                }));

                return this;
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
            }
        });

    }); //define
