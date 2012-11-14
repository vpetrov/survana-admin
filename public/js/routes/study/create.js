/** public/js/routes/study/create.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'jquery',
    'views/study/create'
],
    function ($, CreateStudyView) {
        "use strict";

        return function (options) {
            var store = options.store,
                createStudyView = new CreateStudyView({
                    collection: store.studies,
                    forms: store.forms
                });

            createStudyView.render();

            $('#content').html(createStudyView.el);

            //TODO: update navigation
        };
    }); //define
