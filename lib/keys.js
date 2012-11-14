/** lib/keys.js
 *
 * @author Victor Petrov <victor.petrov@gmail.com>
 * @copyright (c) 2012, The Neuroinformatics Research Group at Harvard University.
 * @copyright (c) 2012, The President and Fellows of Harvard College.
 * @license New BSD License (see LICENSE file for details).
 */

var ursa = require('ursa');

var default_nkeys = 10;
var default_bits = 1024;

/** Generates a list of keypairs (public/private).
 * @param {int} nkeys Number of keys to generate
 * @param {int} bits  Number of bits per key (256, 512, 1024 (default), 2048)
 * @return {Array}    A list of objects of the form {'keyID':'...','bits':N,'publicKey':'...','privateKey':'...'}
 */
exports.generate = function (nkeys, bits) {
    "use strict";

    var result = [],
        keypair,
        publicKey,
        privateKey,
        i;

    //set default values if necessary
    if (!nkeys) {
        nkeys = default_nkeys;
    }

    if (!bits) {
        bits = default_bits;
    }

    //generate ALL the keys!
    for (i = 0; i < nkeys; i += 1) {
        keypair = ursa.generatePrivateKey(bits);      //a binary representation of the keypair
        publicKey = keypair.toPublicPem();            //extract public PEM from keypair
        privateKey = keypair.toPrivatePem();          //extract private PEM from keypair

        result.push({
            'keyID': keypair.toPublicSshFingerprint('hex'),                 //id of the key
            'bits': bits,                                                   //number of bits for the key
            'publicKey': publicKey.toString().replace(/\n|\r/gm, ""),       //the public PEM, no newlines
            'privateKey': privateKey.toString().replace(/\n|\r/gm, "")      //the private PEM, no newlines
        });
    }

    return result;
};
