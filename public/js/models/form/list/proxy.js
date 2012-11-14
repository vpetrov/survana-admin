/** public/js/models/form/list/proxy.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'backbone',
    'models/form/proxy'
],
    function (Backbone, FormProxy) {
        "use strict";

       //A collection for Form placeholders
        return Backbone.Collection.extend({
            model: FormProxy,
            comparator: function (proxy) {
                return proxy.get("index");
            }
        });
    }); //define
