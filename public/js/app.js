/** public/js/app.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define([
    'jquery',
    'backbone',
    'models/form/list',
    'models/study/list',
    'models/user/list',
    'routes'
],
    function ($, Backbone, FormList, StudyList, UserList, Routes) {
        "use strict";

        var store = {};

        //Init all models
        store.forms = new FormList();
        store.studies = new StudyList();
        store.publishers = $.parseJSON($('#store-publishers').html());
        store.users = new UserList();

        //reset models
        store.forms.reset($.parseJSON($('#store-forms').html()));
        store.studies.reset($.parseJSON($('#store-studies').html()));
        store.users.reset($.parseJSON($('#store-users').html()));

        Routes.store = store;

        Backbone.View.prototype.router = Routes;

        Backbone.history.start();

    }); //define
