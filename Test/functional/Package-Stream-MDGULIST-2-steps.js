
/* Feature: Package: Add register report function. */
module.exports = (function() {
    "use strict";
    var English = require('yadda').localisation.English;
    var assert = require('assert');
    return English.library()
    /*Scenario:  */
        .define("Given", function(done) {
            assert(true);
            done();
        })
        .define("When", function(done) {
            assert(true);
            done();
        })
        .define("Then", function(done) {
            assert(true);
            done();
        });
})();