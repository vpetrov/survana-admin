/** public/js/routes/study/view.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'jquery',
    'underscore',
    'views/study/view'
],
    function ($, _, ViewStudyView) {
        "use strict";

        var cache = [];

        return function (sid, options) {
            var store = options.store,
                viewStudy = new ViewStudyView({
                    collection: store.studies,
                    forms:      store.forms,
                    publishers: store.publishers,
                    model:      store.studies.get(sid)
                });

            viewStudy.render();
            viewStudy.onShow();

            $('#content').html(viewStudy.el);
        };
    }); //define
