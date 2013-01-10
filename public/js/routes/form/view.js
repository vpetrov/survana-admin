/** public/js/routes/form/view.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'jquery',
    'underscore',
    'views/form/view'
],
    function ($, _, ViewFormView) {
        "use strict";

        /* note: caching this view needs more thought. This view needs to be refreshed when a fork of the model is
        created.
         */
        return function (fid, options) {
            var store = options.store,
                form;

            form = new ViewFormView({
                collection: store.forms,
                model: store.forms.get(fid)
            });

            form.render();

            $('#content').html(form.el);
        };
    });
