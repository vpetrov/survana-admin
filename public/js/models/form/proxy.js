/** public/js/models/form/proxy.js
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

        //A placeholder for a Form
        return Backbone.Model.extend({
            defaults: function () {
                return {
                    "index": -1,
                    "form":  null
                };
            },
            clear: function () {
                this.destroy();
            }
        });
    }); //define
