define([
    'jquery',
    'views/study/create'
],
    function ($, CreateStudyView) {
        "use strict";

        return function (options) {
            var store = options.store,
                createStudyView = new CreateStudyView({
                    collection: store.studies,
                    forms: store.forms
                });

            createStudyView.render();

            $('#content').html(createStudyView.el);

            //TODO: update navigation
        };
    }); //define
