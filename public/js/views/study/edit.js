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
