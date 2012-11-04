define([
    'jquery',
    'views/home',
    'models/study/list'
],
    function ($, HomeView, StudyList) {
        "use strict";

        var cache = {};

        return function (options) {
            var store = options.store;

            if (!cache.homeView) {
                cache.homeView = new HomeView({
                    collection: store.forms,
                    study_collection: store.studies
                });

                cache.homeView.render();
            } else {
                cache.homeView.delegateEvents();
            }

            //set content
            $('#content').html(cache.homeView.el);

            //TODO: update navigation
        };
    }); //define
