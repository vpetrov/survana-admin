/** public/js/views/alert.js
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
    'bootstrap'
],
    function ($, _, Backbone) {
        "use strict";

        return new (Backbone.View.extend({
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
        }))();

    }); //define
