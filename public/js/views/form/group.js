/** public/js/views/form/group.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var drag_delay = 300;

define([
    'jquery',
    'underscore',
    'backbone',
    'jquery-ui'
],
    function ($, _, Backbone) {
        "use strict";

        //List of all groups
        return Backbone.View.extend({
            template: _.template($('#tpl-form-list').html()),
            itemTemplate: _.template($('#tpl-form-list-item').html()),

            initialize: function () {

                _.bindAll(this, 'render', 'addItem', 'draggable', 'onClick');

                this.collection.on("change reset", this.render);
                this.collection.on("add", this.addItem);
            },

            events: {
                'click a[data-form-id]': 'onClick'
            },

            render: function () {

                var models = this.collection.where({'published': true}),
                    items = _.map(models, function (model) { return model.toJSON(); });

                    //where({'published': true}).toJSON();
                $(this.el).html(this.template({
                    //group items by group_id
                    'items': _.groupBy(items, 'gid'),
                    'itemTemplate': this.itemTemplate,
                    'onlyPublished': true
                }));

                return this;
            },

            onShow: function () {
                this.draggable();
                this.delegateEvents();
            },

            /**
             * Click handler takes at most 3 params: clickHandler(form_id, click_el, e)
             * @param e
             */
            onClick: function (e) {

                this.trigger('formclick', $(e.currentTarget).attr('data-form-id'), e.currentTarget, e);

                e.preventDefault();
                return false;
            },

            addItem: function (newitem) {
                this.$('#form-list').append(this.itemTemplate({
                    'id': newitem.get('id'),
                    'group': newitem.get('group'),
                    'onlyPublished': true
                }));

                return this;
            },

            draggable: function () {
                this.$('.draggable').draggable({
                    helper: "clone",
                    revert: "invalid",
                    connectToSortable: ".sortable-list",
                    delay: drag_delay
                });
            }
        });

    }); //define
