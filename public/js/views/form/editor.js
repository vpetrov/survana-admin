/** public/js/views/form/editor.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

define(
    [
        'jquery',
        'underscore',
        'backbone',
        'ace/ace'
    ],
    function ($, _, Backbone, Ace) {
        "use strict";

        return Backbone.View.extend({

            editor: null,
            text: null,

            initialize: function (options) {
                if (options && options.text) {
                    this.text = options.text;
                }

                _.bindAll(this, 'render');
            },

            render: function () {
                this.$el.addClass('code-editor');
                this.editor = Ace.edit($(this.el).get(0));
                this.editor.setTheme("ace/theme/textmate");
                this.editor.getSession().setMode("ace/mode/json");

                if (this.text) {
                    this.editor.getSession().setValue(this.text);
                }

                return this;
            },

            getEditor: function () {
                return this.editor;
            },

            getText: function () {
                return this.editor.getSession().getDocument().getValue();
            }
        });
    }
);
