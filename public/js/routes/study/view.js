define([
    'jquery',
    'underscore',
    'views/study/view'
],
    function ($, _, ViewStudyView) {
        "use strict";

        return function (sid, options) {
            var store = options.store;

            if (!this.cache) {
                this.cache = [];
            }

            if (!_.has(this.cache, sid)) {
                this.cache[sid] = new ViewStudyView({
                    collection: store.forms,
                    publishers: store.publishers,
                    model:      store.studies.get(sid)
                });

                this.cache[sid].render();
            } else {
                this.cache[sid].delegateEvents();
            }

            $('#content').html(this.cache[sid].el);
        };
    }); //define
