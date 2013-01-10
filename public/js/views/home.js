/** public/js/views/home.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'views/study/list',
    'views/form/list'
],
    function ($, _, Backbone, StudyListView, FormListView) {
        "use strict";

        return Backbone.View.extend({
            template: _.template($('#tpl-home').html()),
            welcomeTemplate: _.template($('#tpl-welcome').html()),
            studyCollection: [],
            studyListView: null,


            formListView: null,

            initialize: function (options) {

                this.studyCollection = options.study_collection;


                this.studyListView = new StudyListView({
                    collection: this.studyCollection
                });

                this.formListView = new FormListView({
                    collection: this.collection
                });

                this.studyCollection.on('change',this.render);
            },

            events: {
                //event listeners go here
            },

            render: function () {
                $(this.el).html(this.template());

                this.studyListView.render();
                this.formListView.render();

                //display a list of all studies
                if (this.studyCollection && this.studyCollection.length) {
                    this.$el.find('#home-study-list').html(this.studyListView.el);
                    this.$el.find('#home-form-list').html(this.formListView.el);

                } else {
                    //display a welcome page
                    this.$el.find('#main-content').html(this.welcomeTemplate());
                }

                return this;
            }
        });

    }); //define
