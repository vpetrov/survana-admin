define([
    'backbone',
    'models/form/proxy'
],
    function (Backbone, FormProxy) {
        "use strict";

       //A collection for Form placeholders
        return Backbone.Collection.extend({
            model: FormProxy,
            comparator: function (proxy) {
                return proxy.get("index");
            }
        });
    }); //define
