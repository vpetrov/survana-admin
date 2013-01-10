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
            modalFormTemplate: _.template($('#tpl-modal-form').html()),

            modalFormSave:null,

            defaults: {
                'message': 'An error has occurred. That\'s all we know.',
                'title': 'Oops!'
            },

            events: {
                'click .modal-form-save': 'onModalFormSave',
                'submit form': 'onModalFormSubmit'
            },

            initialize: function () {
                _.bindAll(this, 'show', 'modal', 'form', 'onModalFormSave', 'onModalFormSubmit');
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
            },

            /**
             *
             * @param data
             * @param title
             * @param onsave callback for the 'Save' button. If it returns false, the modal form is not closed.
             */
            form: function (formdata, title, onsave) {
                var data = {
                    'form': formdata || "",
                    'title': title || this.defaults.title
                };

                $(this.el).html(this.modalFormTemplate(data));

                $('body').append(this.el);

                this.modalFormSave = onsave;

                $(this.el).children('.modal').modal();
            },

            onModalFormSubmit: function (e) {

                this.onModalFormSave(e);

                e.preventDefault();
                return false;
            },

            onModalFormSave: function (e) {
                var data = $(this.el).find('form').serializeArray();

                //attempt to save the form. if the save handler returns false, keep dialog on the screen
                if (this.modalFormSave && (this.modalFormSave(data) === false)) {
                    e.preventDefault();
                    return false;
                }

                //save succeeded, hide the modal dialog
                $(e.currentTarget).parents('.modal').modal('hide');

                return true;
            }
        }))();

    }); //define
