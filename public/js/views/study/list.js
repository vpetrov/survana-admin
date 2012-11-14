/** public/js/views/study/list.js
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
            template:     _.template($('#tpl-study-list').html()),
            itemTemplate: _.template($('#tpl-study-list-item').html()),

            initialize: function () {
                _.bindAll(this, 'render', 'onStudyAdded');

                this.collection.on("change reset", this.render);
                this.collection.on("add", this.onStudyAdded);
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

            onStudyAdded: function (newitem) {
                this.$el.find('tbody').append(this.itemTemplate({
                    'study': newitem.toJSON()
                }));
            }
        });

    }); //define
