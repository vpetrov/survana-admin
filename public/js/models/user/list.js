/** public/js/models/user/list.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'backbone',
    'models/user'
],
    function (Backbone, User) {
        "use strict";

        return Backbone.Collection.extend({
            model: User,
            url: 'users' //TODO: change me
        });
    }); //define
