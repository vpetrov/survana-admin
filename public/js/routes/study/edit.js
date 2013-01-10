/** public/js/routes/study/edit.js
*
* @author Victor Petrov <victor.petrov@gmail.com>
* @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
* @copyright (c) 2012, The President and Fellows of Harvard College.
* @license New BSD License (see LICENSE file for details).
*/

define([
    'jquery',
    'underscore',
    'views/study/edit'
],
    function ($, _, EditStudyView) {
        "use strict";

        var cache = [];

        return function (sid, options) {
            var store = options.store;

            if (!_.has(cache, sid)) {
                cache[sid] = new EditStudyView({
                    collection: store.studies,
                    model: store.studies.get(sid),
                    forms: store.forms
                });
                cache[sid].render();
            }

            cache[sid].onShow();

            $('#content').html(cache[sid].el);
        };
    });
