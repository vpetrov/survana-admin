/** public/js/routes/form/create.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'jquery',
    'views/form/create'
],
    function ($, CreateFormView) {
        "use strict";

        return function (options) {
            var store = options.store,
                createFormView = new CreateFormView({
                    collection: store.forms
                });

            createFormView.render();

            $('#content').html(createFormView.el);

            //TODO: Update navigation
        };

    }); //define
