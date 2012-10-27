define([
    'jquery',
    'views/form/create'
],
    function ($, CreateFormView) {
        "use strict";

        return function (options) {
            var store = options.store;

            this.createFormView = new CreateFormView({
                collection: store.forms
            });

            this.createFormView.render();

            $('#content').html(this.createFormView.el);

            //TODO: Update navigation
        };

    }); //define
