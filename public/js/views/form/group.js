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

            clickHandler: null,

            initialize: function () {

                _.bindAll(this, 'render', 'addItem', 'draggable');

                this.collection.on("change reset", this.render);
                this.collection.on("add", this.addItem);
            },

            render: function () {
                $(this.el).html(this.template({
                    //group items by group_id
                    'items': _.groupBy(this.collection.toJSON(), 'gid'),
                    'itemTemplate': this.itemTemplate
                }));
                this.draggable();
                this.addClickHandler();
                return this;
            },

            addItem: function (newitem) {
                this.$('#form-list').append(this.itemTemplate({
                    'id': newitem.get('id'),
                    'group': newitem.get('group')
                }));

                this.addClickHandler();
                return this;
            },

            addClickHandler: function () {
                console.log('registering click handler');
                this.$('#form-list').find('a').click(this.clickHandler);
            },

            draggable: function () {
                this.$('.draggable').draggable({
                    helper: "clone",
                    revert: "invalid",
                    connectToSortable: ".sortable-list",
                    delay: drag_delay
                });
            },

            click: function (fn) {
                this.clickHandler = fn;
            }
        });

    }); //define
