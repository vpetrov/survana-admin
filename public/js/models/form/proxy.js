define([
    'backbone'
],
    function (Backbone) {
        "use strict";

        //A placeholder for a Form
        return Backbone.Model.extend({
            defaults: function () {
                return {
                    "index": -1,
                    "form":  null
                };
            },
            clear: function () {
                this.destroy();
            }
        });
    }); //define
