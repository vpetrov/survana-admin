/** public/js/models/study.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

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
                    forms: [],
                    overrides: [],
                    "store-url": null
                };
            },

            initialize: function () {
                this.set({
                    'created_on':   this.get('created_on')  || this.defaults.created_on,
                    'title':        this.get('title')       || this.defaults.title,
                    'publishers':   this.get('publishers')  || this.defaults.publishers,
                    'urls':         this.get('urls')        || this.defaults.urls,
                    'install':      this.get('install')     || this.defaults.install,
                    'forms':        this.get('forms')       || this.defaults.forms,
                    'store-url':    this.get('store-url')   || this.defaults['store-url'],
                    "overrides":    this.get('overrides')   || this.defaults.overrides
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
