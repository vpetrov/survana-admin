define([
    'jquery',
    'views/form/create'
],
    function ($, CreateFormView) {
        "use strict";

        return function (options) {
            var store = options.store,
                createFormView = new CreateFormView({
                    collection: store.forms
                });

            createFormView.render();

            $('#content').html(createFormView.el);

            //TODO: Update navigation
        };

    }); //define
