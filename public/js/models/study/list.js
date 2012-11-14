/** public/js/models/study/list.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'backbone',
    'models/study'
],
    function (Backbone, Study) {
        "use strict";

        return Backbone.Collection.extend({
            model: Study,
            url: 'studies' //TODO: change me
        });
    }); //define
