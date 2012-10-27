define([
    'jquery',
    'underscore',
    'views/form/view'
],
    function ($, _, ViewFormView) {
        "use strict";

        return function (fid, options) {
            var store = options.store;

            if (!this.cache)
                this.cache = [];

            if (!_.has(this.cache, fid)) {
                this.cache[fid] = new ViewFormView({
                    collection: store.forms,
                    model:      store.forms.get(fid)
                });

                this.cache[fid].render();
            } else {
                this.cache[fid].delegateEvents();
            }

            $('#content').html(this.cache[fid].el);
        }
    });
