define([
    'backbone',
    'models/form'
],
    function (Backbone, Form) {
        "use strict";

        //A collection of Forms
        return Backbone.Collection.extend({
            model: Form,
            url: 'forms'
        });

    }); //define
