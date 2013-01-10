/** public/js/views/form/list.js
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
            template:     _.template($('#tpl-form-list-table').html()),
            itemTemplate: _.template($('#tpl-form-list-table-item').html()),

            initialize: function () {
                _.bindAll(this, 'render', 'onFormAdded');

                this.collection.on("change reset", this.render);
                this.collection.on("add", this.onFormAdded);
            },

            events: {
            },

            render: function () {

                var groups = _.groupBy(this.collection.toJSON(), 'gid'),
                    publishInfo = {},
                    group,
                    gid,
                    counter = function (item) {
                        return item.published ? 'published' : 'drafts';
                    };

                //extract number of published/drafts
                for (gid in groups) {
                    if (groups.hasOwnProperty(gid)) {
                        group = groups[gid];
                        publishInfo[gid] = _.countBy(group, counter);
                    }
                }

                $(this.el).html(this.template({
                    'items': groups,
                    'itemTemplate': this.itemTemplate,
                    'publishInfo': publishInfo
                }));

                return this;
            },

            onFormAdded: function (newitem) {
                this.$el.find('tbody').append(this.itemTemplate({
                    'form': newitem.toJSON(),
                    'publishInfo': {'drafts': 1, 'published':   0}
                }));
            }
        });

    }); //define
