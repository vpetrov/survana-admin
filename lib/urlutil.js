/** lib/urlutil.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var slash_regex = new RegExp('([^:])\\/+', 'g');

exports.normalize = function (url) {
    "use strict";

    //replace multiple slashes with a single slash (except for the protocol)
    return url.replace(slash_regex, '$1/');
};
