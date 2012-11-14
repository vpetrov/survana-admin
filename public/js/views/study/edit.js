/** public/js/views/study/edit.js
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
            template: _.template($('#tpl-study-edit').html()),

            initialize: function () {
                _.bindAll(this, 'render');
            },

            events: {
            },

            render: function () {
                $(this.el).html(this.template(this.model.toJSON()));

                return this;
            }
        });
    }); //define
