define([
    'jquery',
    'backbone',
    'routes/home',
    'routes/study/create',
    'routes/study/view',
    'routes/study/edit',
    'routes/form/create',
    'routes/form/view',
    'routes/form/edit'
],
    function ($, Backbone, Home, CreateStudy, ViewStudy, EditStudy, CreateForm, ViewForm, EditForm) {
        "use strict";

        return new (Backbone.Router.extend({

            store: {},

            initialize: function (options) {

                if (options) {
                    this.store = options.store;
                }
            },

            routes: {
                '': "home",
                'study/create': "create_study",
                'study/:id': "view_study",
                'study/:id/edit': "edit_study",
                'form/create': "create_form",
                'form/:id': "view_form",
                'form/:id/edit': "edit_form"
            },

            //NOTES: If these routes are not instantiated with 'new', they all share the same 'this' object

            "home": function () {
                return new Home({
                    store: this.store
                });
            },

            "create_form": function () {
                return new CreateForm({
                    store: this.store
                });
            },

            "create_study": function () {
                return new CreateStudy({
                    store: this.store
                });
            },
            "view_study": function (sid) {
                return new ViewStudy(sid, {
                    store: this.store
                });
            },
            "edit_study": function (sid) {
                return new EditStudy(sid, {
                    store: this.store
                });
            },
            "view_form": function (fid) {
                return new ViewForm(fid, {
                    store: this.store
                });
            },
            "edit_form": function (fid) {
                return new EditForm(fid, {
                    store: this.store
                });
            }
        }))();

    }); //define
