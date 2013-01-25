/** public/js/models/form.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'jquery',
    'backbone'
],
    function ($, Backbone) {
        "use strict";

        return Backbone.Model.extend({
            urlRoot:  'form',
            defaults: function () {
                return {
                    gid:        0,
                    group:      "",
                    code:       "",
                    title:      "",
                    display_title: true,
                    version:    "",
                    created_on: 0,
                    data:       "",
                    published:  false
                };
            },

            initialize: function () {
                if (!this.get("title")) {
                    this.set({
                        "gid":          this.get('gid')         || this.defaults.gid,
                        "group":        this.get('group')       || this.defaults.group,
                        "code":         this.get('code')        || this.defaults.code,
                        "title":        this.get('title')       || this.defaults.title,
                        "display_title": this.get('display_title') || this.defaults.display_title,
                        "version":      this.get('version')     || this.defaults.version,
                        "created_on":   this.get('created_on')  || this.defaults.created_on,
                        "data":         this.get('data')        || this.defaults.data,
                        "published":    this.get('published')   || this.defaults.published,
                        "store-url":    this.get('store-url')   || this.defaults['store-url']
                    });
                }
            },

            clear: function () {
                this.destroy();
            },

            validate: function (attr) {
                var result = {},
                    e = 0;

                if (!attr.title) {
                    result.title = 'Please specify a name';
                    e = 1;
                }

                if (!attr.code) {
                    result.code = 'Please specify a form code';
                    e = 1;
                }

                if (!attr.version) {
                    result.version = 'Please specify a version number for this form';
                    e = 1;
                }

                if (!attr.data) {
                    result.data = 'Please add questions to your form';
                    e = 1;
                } else {
                    try {
                        $.parseJSON(attr.data);
                    } catch (err) {
                        result.data = err.message;
                        e = 1;
                    }
                }

                if (e) {
                    return result;
                }

                return undefined;
            }

        });
    }); //define
