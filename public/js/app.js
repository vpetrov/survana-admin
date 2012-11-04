define([
    'jquery',
    'backbone',
    'models/form/list',
    'models/study/list',
    'routes'
],
    function ($, Backbone, FormList, StudyList, Routes) {
        "use strict";

        var store = {};

        //Init all models
        store.forms = new FormList();
        store.studies = new StudyList();
        store.publishers = $.parseJSON($('#store-publishers').html());

        //reset models
        store.forms.reset($.parseJSON($('#store-forms').html()));
        store.studies.reset($.parseJSON($('#store-studies').html()));

        console.log('store publishers', store.publishers);
        Routes.store = store;

        Backbone.View.prototype.router = Routes;

        Backbone.history.start();

    }); //define
