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
                    model: store.studies.get(sid)
                });
                cache[sid].render();
            } else {
                cache[sid].delegateEvents();
            }

            $('#content').html(cache[sid].el);
        };
    });
