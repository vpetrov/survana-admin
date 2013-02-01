/** public/js/models/user.js
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
            urlRoot: 'user',
            defaults: function () {
                return {
                    email:      '',
                    name:       '',
                    last_login: 0
                };
            },

            initialize: function () {
                this.set({
                    'email':        this.get('email')       || this.defaults.email,
                    'name':         this.get('name')        || this.defaults.name,
                    'last_login':   this.get('last_login')  || this.defaults.last_login
                });
            },

            validate: function (attr) {
                var result = {},
                    e = 0;

                if (!attr.email) {
                    result.email = 'Please specify an email for this user';
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
