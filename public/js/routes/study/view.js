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
            var store = options.store;

            if (!_.has(cache, sid)) {
                cache[sid] = new ViewStudyView({
                    collection: store.forms,
                    publishers: store.publishers,
                    model:      store.studies.get(sid)
                });

                cache[sid].render();
            } else {
                cache[sid].delegateEvents();
            }

            $('#content').html(cache[sid].el);
        };
    }); //define
