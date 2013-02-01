/** public/js/views/user/list.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'jquery',
	'underscore',
	'backbone'
],
    function ($, _, Backbone) {
        "use strict";

        return Backbone.View.extend({
            template:     _.template($('#tpl-user-list').html()),
            itemTemplate: _.template($('#tpl-user-list-item').html()),

            initialize: function () {
                _.bindAll(this, 'render', 'onUserAdded');

                this.collection.on("change reset", this.render);
                this.collection.on("add", this.onUserAdded);
            },

            events: {
            },

            render: function () {
                $(this.el).html(this.template({
                    'items': this.collection.toJSON(),
                    'itemTemplate': this.itemTemplate
                }));

                return this;
            },

            onUserAdded: function (newitem) {
                this.$el.find('tbody').append(this.itemTemplate({
                    'user': newitem.toJSON()
                }));
            }
        });

    }); //define
