define([
    'jquery',
    'underscore',
    'backbone',
    'bootstrap'
],
    function ($, _, Backbone) {
        "use strict";

        return Backbone.View.extend({
            container: '#messages',
            template: _.template($('#tpl-alert').html()),
            modalTemplate: _.template($('#tpl-modal-alert').html()),

            defaults: {
                'message': 'An error has occurred. That\'s all we know.',
                'title': 'Oops!'
            },

            initialize: function () {
                _.bindAll(this, 'show', 'modal');
            },

            render: function () {

            },

            show: function (message) {
                $(this.container).html(this.template({
                    'message': message || this.defaults.message
                }));
                $(this.container).children('.alert').alert(); //bootstrap.alert()
            },

            modal: function (message, title) {
                var data = {
                    'message': message || this.defaults.message,
                    'title': title || this.defaults.title
                };

                $(this.el).html(this.modalTemplate(data));

                $('body').append(this.el);

                $(this.el).children('.modal').modal(); //bootstrap.modal()
            }
        });

    }); //define
