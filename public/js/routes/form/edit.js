define([
    'jquery',
    'underscore',
    'views/form/edit'
],
    function ($, _, EditFormView) {
        "use strict";

        var cache = [];

        return function (fid, options) {
            var store = options.store;

            if (!_.has(cache, fid)) {
                cache[fid] = new EditFormView({
                    collection: store.forms,
                    model:      store.forms.get(fid)
                });
                cache[fid].render();
            } else {
                cache[fid].delegateEvents();
            }

            $('#content').html(cache[fid].el);
        };
    });
