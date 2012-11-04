define([
    'jquery',
    'underscore',
    'views/form/view'
],
    function ($, _, ViewFormView) {
        "use strict";

        var cache = [];

        return function (fid, options) {
            var store = options.store;

            if (!_.has(cache, fid)) {
                cache[fid] = new ViewFormView({
                    collection: store.forms,
                    model: store.forms.get(fid)
                });

                cache[fid].render();
            } else {
                cache[fid].delegateEvents();
            }

            $('#content').html(cache[fid].el);
        };
    });
