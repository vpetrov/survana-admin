/** public/js/routes/home.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'jquery',
    'views/home',
    'models/study/list'
],
    function ($, HomeView, StudyList) {
        "use strict";

        var cache = {};

        return function (options) {
            var store = options.store;

            if (!cache.homeView) {
                cache.homeView = new HomeView({
                    collection: store.forms,
                    study_collection: store.studies,
                    user_collection: store.users
                });

                cache.homeView.render();
            } else {
                cache.homeView.delegateEvents();
            }

            //set content
            $('#content').html(cache.homeView.el);

            //TODO: update navigation
        };
    }); //define
