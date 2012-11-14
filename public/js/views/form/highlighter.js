/** public/js/views/form/highlighter.js
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
        'ace/ext/static_highlight',
        'ace/mode/json',
        'ace/theme/chrome'
    ],
    function ($, _, Backbone, AceHighlighter, AceMode, AceTheme) {
        "use strict";

        return Backbone.View.extend({

            highlighter: AceHighlighter,
            text: "",
            initialize: function (options) {
                this.text = options.text;
                _.bindAll(this, 'render', 'getHighlighter', 'getText');
            },

            render: function () {
                var result = this.highlighter.render(this.text, new AceMode.Mode(), AceTheme),
                    style = $(document.createElement('style')).attr('type', 'text/css').html(result.css),
                    source = $(document.createElement('div')).html(result.html);

                this.$el.append(style).append(source);

                //hide the ugly border
                this.$el.find('div.ace_editor').css('border', 'none');

                return this;
            },

            getHighlighter: function () {
                return this.highlighter;
            },

            getText: function () {
                return this.text;
            }
        });
    }
);
