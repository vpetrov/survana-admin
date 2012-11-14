/** public/js/models/form/list.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'backbone',
    'models/form'
],
    function (Backbone, Form) {
        "use strict";

        //A collection of Forms
        return Backbone.Collection.extend({
            model: Form,
            url: 'forms'
        });

    }); //define
