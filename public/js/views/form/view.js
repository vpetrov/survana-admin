/** public/js/views/form/view.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var css_height_scale = 18;

define([
    'jquery',
    'underscore',
    'backbone',
    'models/form',
    'views/alert',
    'views/form/highlighter',
    'errors'
],
    function ($, _, Backbone, Form, Alert, Highlighter, Errors) {
        "use strict";

        return Backbone.View.extend({
            template: _.template($('#tpl-form-view').html()),
            menuTemplate: _.template($('#tpl-form-version-menu').html()),
            group: [],
            highlighter: null,

            initialize: function () {
                _.bindAll(this, 'render', 'preview', 'publish', 'onPublishClick', 'onPreviewClick', 'onVersionClick');

                if (!this.model) {
                    Alert.modal('This form does not exist.');
                    return;
                }

                this.model.on('change', this.render);
            },

            events: {
                'click .btn-form-preview': 'onPreviewClick',
                'click .btn-form-publish': 'onPublishClick',
                'click .btn-form-edit': 'onEditClick',
                'click .btn-form-fork': 'onForkClick',
                'click ul.dropdown-menu li': 'onVersionClick'
            },

            render: function () {
                var model = this.model.toJSON(),
                    group,
                    container;

                group = this.collection.
                    where({'gid': this.model.get('gid')}). //find all forms belonging to this gid
                    map(function (item) {                  //convert all results to JSON
                        return item.toJSON();
                    });

                //main page
                $(this.el).html(this.template(model));

                //version menu
                $(this.el).find('.form-versions').replaceWith(this.menuTemplate({
                    'group': group,
                    'onlyPublished': false
                }));

                //highlighter
                this.highlighter = new Highlighter({
                    text: JSON.stringify(model.data, null, 8)
                });
                this.highlighter.render();

                container = this.$el.find('#code-viewer-container');
                container.html(this.highlighter.el);

                //hack to get the buttons below to render appropriately
                container.css('height', (container.find('div.ace_line').length * css_height_scale) + 'px');

                return this;
            },

            preview: function () {
                var form = this.$el.find('form.preview'),
                    previewId = 'formpreview_' + this.model.get('id');

                form.find('input').val(JSON.stringify(this.model.toJSON()));

                //register the submit handler
                form.submit(function () {
                    window.open('', previewId);
                    this.target = previewId;
                });

                //submit the form
                form.submit();
            },

            publish: function () {
                if (this.model.get('published')) {
                    return;
                }

                this.model.save({
                    'published': true
                },
                    {
                        'wait': true,
                        'success': function (model, updates) {
                            model.set(updates, {silent: true});
                        },
                        'error': function (model, result, caller) {
                            console.error('Failed to publish form', model, result, caller);
                        }
                    });
            },

            fork: function () {
                var newmodel,
                    data,
                    forms = this.collection,
                    el = this.$el,
                    router = this.router;

                if (!this.model.get('published')) {
                    return;
                }

                newmodel = new Form();
                data = this.model.toJSON();

                //remove properties that shouldn't be present in a fork of the current form
                delete data.id;
                delete data.created_on;
                data.published = false;
                data.version = data.version + ' copy';

                try {
                    newmodel.save(data, {
                        'wait': true,
                        'success': function (model, updates) {
                            model.set(updates, {silent: true});
                            forms.add(model);

                            router.navigate('form/' + model.get('id'), {'trigger': true});
                        },
                        'error': this.onSubmitError
                    });
                } catch (err) {
                    console.error(err, err.message);
                }
            },

            onPreviewClick: function (e) {
                this.preview();

                e.preventDefault();
                return false;
            },

            onPublishClick: function (e) {

                var view = this;

                Alert.ask("Are you sure you would like to publish this form? " +
                    "You will not be able to edit it in the future.",
                    "Confirm action",
                    {"Publish": 1},
                    function (button) {
                        if (button === 'Publish') {
                            view.publish();
                        }
                    });

                e.preventDefault();
                return false;
            },

            onEditClick: function (e) {
                this.router.navigate('form/' + this.model.get('id') + '/edit', {trigger: true});
                e.preventDefault();
                return false;
            },

            onForkClick: function (e) {
                this.fork();

                e.preventDefault();
                return false;
            },

            onVersionClick: function (e) {
                var target = e.currentTarget,
                    formUrl = '#form/' + $(target).children('a').attr('data-form-id');

                $(target).parents('ul.dropdown-menu').first().dropdown('toggle');
                this.router.navigate(formUrl, {trigger: true});

                e.preventDefault();
                return false;
            },

            onSubmitError: function (model, result, caller) {
                Errors.onSubmit(this, model, result, caller);
            }
        });

    }); //define
