/** lib/blacklist.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

//properties to delete when publishing a study
exports.publish = {
    '_id': 0,
    'publishers': 0,
    'urls': 0,
    'published': 0
};

exports.keys = {
    'privateKey': 0
};

//an option object for use with mongodb. it prevents the db from returning sensitive information.
exports.study = {
    '_id': 0,
    'keys': 0
};

//properties to blacklist when updating a study object
exports.study_update = {
    '_id': 0,
    'keys': 0,
    'created_on': 0
};

exports.form = {
    '_id': 0
};

exports.user = {
    'id': 0
};

