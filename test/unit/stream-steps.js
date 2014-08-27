/* jslint node: true */
"use strict";
var fs = require('fs');
var gutil = require('gulp-util');
var gulp = require('gulp');
var istanbul = require('../../lib/index');
var mocha = require('gulp-mocha');
var _ = require('lodash');
var English = require('yadda').localisation.English;
var assert = require('assert');

var out = process.stdout.write.bind(process.stdout);
var libFile = new gutil.File({
    path: 'test/resources/lib/add.js',
    cwd: 'test/',
    base: 'test/resources/lib',
    contents: fs.readFileSync('test/resources/lib/add.js')
});
var srcFile = new gutil.File({
    path: 'test/resources/lib/add.js',
    cwd: 'test/',
    base: 'test/resources/lib',
    contents: fs.createReadStream('test/resources/lib/add.js')
});

/* Feature: gulp-istanbul */
module.exports = (function() {
    return English.library()
    /*Scenario: istanbul() instrument a file */
        .define("Given a Javascript (?:file|file stream)", function(done) {
            assert(true);
            done();
        })
        .define("When istanbul is executed", function(done) {
            this.world.stream = null;
            this.world.stream = istanbul();
            done();
        })
        .define("Then the file is instrumented", function(done) {
            this.world.stream.on('data', function (file) {
                assert.equal(file.path, libFile.path);
                assert.ok(file.contents.toString().indexOf('__cov_') >= 0);
                assert.ok(file.contents.toString().indexOf('$$cov_') >= 0);
                done();
            });

            this.world.stream.write(libFile);
            this.world.stream.end();
        })/*Scenario: istanbul() instrument a stream */
        .define("Then a streams not supported error is thrown", function(done) {
            this.world.stream.on('error', function (err) {
                assert.ok(err);
                done();
            });

            this.world.stream.write(srcFile);
            this.world.stream.end();
        })/*Scenario: istanbul.summarizeCoverage() */
        .define("Given files have been instrumented and tests run", function(done) {
            gulp.src([ 'test/resources/lib/*.js' ])
                .pipe(istanbul())
                .on('finish', function () {
                    process.stdout.write = function () {
                    };
                    gulp.src([ 'test/resources/test/*.js' ])
                        .pipe(mocha({ reporter: 'spec' }))
                        .on('finish', done);
                });
        })
        .define("When istanbul.summarizeCoverage is executed", function(done) {
            this.world.data = istanbul.summarizeCoverage();
            done();
        })
        .define("Then statistics about the test run are returned", function(done) {
            assert.equal(this.world.data.lines.pct, 75);
            assert.equal(this.world.data.statements.pct, 75);
            assert.equal(this.world.data.functions.pct, 50);
            assert.equal(this.world.data.branches.pct, 100);
            done();
        })/*Scenario: istanbul.registerReport() */
        .define("When istanbul.registerReport is executed", function(done) {
            istanbul.registerReport(require('istanbul-reporter-clover-limits'));
            done();
        })
        .define("Then a custom report is registered", function(done) {
            var invalid = _.difference(['clover-limits'], istanbul.istanbul().Report.getReportList());
            assert.ok(invalid);
            done();
        })/*Scenario: istanbul.writeReports() */
        .define("Given files have been instrumented", function(done) {
            // set up coverage
            gulp.src([ 'test/resources/lib/*.js' ])
                .on('end', done)
                .pipe(istanbul());
        })
        .define("When istanbul.writeReports is executed", function(done) {
            assert(true);
            done();
        })
        .define("Then coverage report is output to stdout", function(done) {
            gulp.src([ 'test/resources/test/*.js' ])
                .pipe(mocha({ reporter: 'spec' }))
                .pipe(istanbul.writeReports('test/coverage'));

            process.stdout.write = function (str) {
                if (str.indexOf('==== Coverage summary ====') >= 0) {
                    done();
                }
            };
        })
        .define("Then coverage report is output to file", function(done) {
            process.stdout.write = function () {
            };
            gulp.src([ 'test/resources/test/*.js' ])
                .pipe(mocha({ reporter: 'spec' }))
                .pipe(istanbul.writeReports('test/coverage'))
                .on('end', function () {
                    assert(fs.existsSync('test/coverage'));
                    assert(fs.existsSync('test/coverage/lcov.info'));
                    assert(fs.existsSync('test/coverage/coverage-final.json'));
                    done();
                });
        })/*Scenario: istanbul.writeReports() with directory */
        .define("When istanbul.writeReports is executed with directory specified in the legacy way", function(done) {
            assert(true);
            done();
        })
        .define("Then coverage report is output to specified directory", function(done) {
            process.stdout.write = function () {
            };
            gulp.src([ 'test/resources/test/*.js' ])
                .pipe(mocha({ reporter: 'spec' }))
                .pipe(istanbul.writeReports('test/coverage/cov-foo1'))
                .on('end', function () {
                    assert(fs.existsSync('test/coverage/cov-foo1'));
                    assert(fs.existsSync('test/coverage/cov-foo1/lcov.info'));
                    assert(fs.existsSync('test/coverage/cov-foo1/coverage-final.json'));
                    done();
                });
        })
        .define("When istanbul.writeReports is executed with directory specified", function(done) {
            assert(true);
            done();
        })
        /*Scenario: istanbul.writeReports() with specified reporter */
        .define("When istanbul.writeReports is executed with valid reporter specified", function(done) {
            assert(true);
            done();
        })
        .define("Then coverage report is output using specified reporter", function(done) {
            process.stdout.write = function () {
            };
            gulp.src([ 'test/resources/test/*.js' ])
                .pipe(mocha({ reporter: 'spec' }))
                .pipe(istanbul.writeReports({ dir: 'test/coverage/cov-foo2', reporters: ['cobertura'] }))
                .on('end', function () {
                    assert(fs.existsSync('test/coverage/cov-foo2'));
                    assert(!fs.existsSync('test/coverage/cov-foo2/lcov.info'));
                    assert(fs.existsSync('test/coverage/cov-foo2/cobertura-coverage.xml'));
                    process.stdout.write = out;
                    done();
                });
        })
        .define("When istanbul.writeReports is executed with an invalid reporter specified", function(done) {
            assert(true);
            done();
        })
        .define("Then an invalid reporter error is thrown", function(done) {
            var actualErr;
            try {
                istanbul.writeReports({ reporters: ['not-a-valid-reporter'] });
            } catch (err) {
                actualErr = err;
            }
            assert.ok(actualErr.plugin === 'gulp-istanbul');
            done();
        });
})();