/** public/js/views/study/forms.js
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
    'jquery-ui',
    'bootstrap',
    'models/form/list/proxy'
],
    function ($, _, Backbone, jQueryUI, bootstrap, FormListProxy) {
        "use strict";

        return Backbone.View.extend({
            proxyCollection: null,
            template: _.template($('#tpl-study-forms').html()),
            itemTemplate: _.template($('#tpl-study-forms-item').html()),
            titleTemplate: _.template($('#tpl-study-forms-title').html()),
            menuTemplate: _.template($('#tpl-form-version-menu').html()),

            sortStartedAt: -1,
            sortStoppedAt: -1,

            initialize: function (options) {
                console.log('Initializing StudyFormsView', options);
                _.bindAll(this, 'render', 'onItemInserted', 'getModel', 'getForms', 'setForms', 'sortStarted',
                          'sortEnded', 'insert', 'onMenuItemSelect', 'onDragOut', 'onDragIn', 'onDragStop', 'onShow');

                //proxy model
                this.proxyCollection = new FormListProxy();

                if (options.forms) {
                    this.setForms(options.forms);
                }

                this.collection.on("change", this.render);


                //this.render(this.collection);
            },

            events: {
                'click a[data-form-id][data-form-version]': 'onMenuItemSelect'
            },

            render: function () {
                console.log('render study/forms.js');
                var i,
                    items = [],
                    groups = {};

                function compare1(a, b) {
                    return b.created_on - a.created_on;
                }

                items = this.getForms();

                for (i = 0; i < items.length; i += 1) {
                    groups[items[i].gid] = this.collection.where({'gid': items[i].gid}).map(function (form) {
                        return form.toJSON();
                    });
                }

                //create template
                $(this.el).html(this.template({
                    'items': items,
                    'groups': groups,
                    'itemTemplate': this.itemTemplate,
                    'titleTemplate': this.titleTemplate,
                    'menuTemplate': this.menuTemplate,
                    'onlyPublished': false
                }));

                return this;
            },

            onShow: function () {
                this.delegateEvents();

                //sortable list properties
                this.$('.sortable-list').sortable({
                    'revert': false,
                    'distance': 10,
                    'receive': $.proxy(this.onItemInserted, this),
                    'start': $.proxy(this.sortStarted, this),
                    'beforeStop': $.proxy(this.sortEnded, this),
                    'stop': $.proxy(this.updateIndexes, this),
                    'out': $.proxy(this.onDragOut, this),
                    'over': $.proxy(this.onDragIn, this)
                });

                //disable user select (conflicts with dragging)
                $('.sortable-list').disableSelection();
            },

            onItemInserted: function (e, ui) {
                var id = ui.item.children('a[data-form-id]').attr('data-form-id'),
                    model = this.collection.get(id),
                    el = this.$('li.draggable').not('.active');

                this.proxyCollection.add({
                    'index': this.sortStartedAt,
                    'form': model
                });

                this.replace(el, this.sortStartedAt, id);
            },

            replace: function (item, index, id) {
                var model = this.collection.get(id),
                    proxyModel = this.proxyCollection.where({'index': index}),
                    group,
                    el;

                if (model === undefined || !model) {
                    console.error('Could not find model with ID', id);
                    return false;
                }

                if (proxyModel.length > 1) {
                    console.error('Consistency error: Found more than 1 item at position', index, proxyModel);
                    return false;
                }

                group = this.collection.
                    //find all forms belonging to this gid
                    where({'gid': model.get('gid')}).
                    //convert all results to JSON
                    map(function (item) {
                        return item.toJSON();
                    });

                //sort in descending order of creation time
                group.sort(function (a, b) {
                    return b.created_on - a.created_on;
                });

                //replace the form model in the current proxy model
                if (proxyModel.length) {
                    proxyModel[0].set('form', model);
                } else {
                    //add a new model to the proxy collection
                    this.proxyCollection.add({
                        'index': index,
                        'form': model
                    });
                }

                el = $(this.itemTemplate({
                    'item': model.toJSON(),
                    'group': group,
                    'titleTemplate': this.titleTemplate,
                    'menuTemplate': this.menuTemplate,
                    'onlyPublished': false
                }));

                //replace the placeholder with the real item
                $(item).replaceWith(el);

                return true;
            },

            insert: function (id) {
                console.log('inserting new form',id);
                var model = this.collection.get(id),
                    item = $('<li></li>');

                if (!model) {
                    return false;
                }

                this.$('.sortable-list').append(item);    //append item to list of forms in the study
                this.replace(item, item.index(), id);   //replace the item
            },

            removeItem: function (item) {
                console.log('Removing item', item);
            },

            sortStarted: function (e, ui) {
                this.sortStartedAt = ui.item.index();
            },

            sortEnded: function (e, ui) {
                this.sortStoppedAt = ui.item.index();
            },

            /**
             * @callback with 2 parameters: e:Event and ui:JqueryUI
             */
            updateIndexes: function () {
                var from = this.sortStartedAt,
                    to = this.sortStoppedAt;

                this.proxyCollection.each(function (item) {
                    var idx = item.get('index');

                    if (from >= to) {                           //if an item was moved up
                        if (idx === from) {
                            item.set('index', to);              //change index to destination
                        } else if (idx >= to && idx < from) {
                            item.set('index', idx + 1);         //all items in between are incremented
                        }
                                                                //other elements are ignored
                    } else {                                    //if an item was moved down
                        if (idx === from) {
                            item.set('index', to);
                        } else if (idx <= to && idx > from) {
                            item.set('index', idx - 1);
                        }
                    }
                });

                this.proxyCollection.sort({silent: true});

                console.log(from, to, this.proxyCollection.map(function (item) {
                    var form = item.get('form');
                    return item.get('index') + ':' + form.get('code') + '/' + form.get('version');
                }));

                this.trigger('indexchange',from,to);

                this.sortStartedAt = -1;
                this.sortStoppedAt = -1;
            },

            getModel: function () {
                return this.proxyCollection;
            },

            getForms: function () {
                //convert all results to JSON
                return this.proxyCollection.map(function (item) {
                    return item.get('form').toJSON();
                });
            },

            setForms: function (forms) {
                var i,
                    model;

                for (i = 0; i < forms.length; i += 1) {
                    model = this.collection.get(forms[i]);

                    if (model) {
                        this.proxyCollection.add({
                            'index': i,
                            'form': model
                        }, {
                            'silent': true
                        });
                    }
                }
            },

            onMenuItemSelect: function (e) {
                var el = $(e.currentTarget),
                    id = el.attr('data-form-id'),
                    item = el.parents('li.active.dropdown');

                this.replace(item, item.index(), id);

                e.preventDefault();

                return false;
            },

            onDragOut: function (e, ui) {
                console.log('drag out: adding class');
                $(ui.helper).find('a.dropdown').addClass('build-form-remove');
                $(ui.helper).on('mouseup', $.proxy(this.onDragStop, this));
            },

            onDragIn: function (e, ui) {
                console.log('drag in: removing class');
                $(ui.helper).find('a.dropdown').removeClass('build-form-remove');
            },

            onDragStop: function (e) {
                var item = $(e.currentTarget),
                    handle = item.children('a.dropdown');

                item.off('mouseup');

                if (handle.hasClass('build-form-remove')) {
                    handle.removeClass('build-form-remove');
                    this.removeItem(item);
                }
            }
        });

    }); //define
