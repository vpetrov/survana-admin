define([
    'backbone'
],
    function (Backbone) {
        "use strict";

        return Backbone.Model.extend({
            urlRoot: 'study',
            defaults: function () {
                return {
                    created_on: 0,
                    title: "",
                    publishers: [],
                    urls: {},
                    install: true,
                    forms: []
                };
            },

            initialize: function () {
                this.set({
                    'created_on':   this.get('created_on')  || this.defaults.created_on,
                    'title':        this.get('title')       || this.defaults.title,
                    'publishers':   this.get('publishers')  || this.defaults.publishers,
                    'urls':         this.get('urls')        || this.defaults.urls,
                    'install':      this.get('install')     || this.defaults.install,
                    'forms':        this.get('forms')       || this.defaults.forms
                });
            },

            validate: function (attr) {
                var result = {},
                    e = 0;

                if (!attr.title) {
                    result.title = 'Please specify a title for the study';
                    e = 1;
                }

                if (e) {
                    return result;
                }

                return undefined;
            },

            clear: function () {
                this.destroy();
            }
        });

    }); //define
