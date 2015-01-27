"use strict";
/* Feature: gulp-istanbul */
module.exports = (function testSuite() {
  var English = require("yadda").localisation.English;
  var assert = require("assert");

  var fs = require("fs");
  var gutil = require("gulp-util");
  var gulp = require("gulp");
  var istanbul = require("../../lib/index");
  var mocha = require("gulp-mocha");
  var _ = require("lodash");
  var out = process.stdout.write.bind(process.stdout);

  var libFile = new gutil.File({
    "path": "Test_Resources/resources/lib/add.js",
    "cwd": "Test_Resources/",
    "base": "Test_Resources/resources/lib",
    "contents": fs.readFileSync("Test_Resources/resources/lib/add.js")
  });
  var srcFile = new gutil.File({
    "path": "Test_Resources/resources/lib/add.js",
    "cwd": "Test_Resources/",
    "base": "Test_Resources/resources/lib",
    "contents": fs.createReadStream("Test_Resources/resources/lib/add.js")
  });

  return English.library()
    /*Scenario: istanbul() instrument a file */
    .define("Given a Javascript (?:file|file stream)", function test(done) {
      assert(true);
      done();
    })
    .define("When istanbul is executed", function test(done) {
      this.world.stream = null;
      this.world.stream = istanbul();
      done();
    })
    .define("Then the file is instrumented", function test(done) {
      this.world.stream.on("data", function onData(file) {
        assert.equal(file.path, libFile.path);
        assert.ok(file.contents.toString().indexOf("__cov_") >= 0);
        assert.ok(file.contents.toString().indexOf("$$cov_") >= 0);
        done();
      });

      this.world.stream.write(libFile);
      this.world.stream.end();
    })/*Scenario: istanbul() instrument a stream */
    .define("Then a streams not supported error is thrown", function test(done) {
      this.world.stream.on("error", function onError(err) {
        assert.ok(err);
        done();
      });

      this.world.stream.write(srcFile);
      this.world.stream.end();
    })/*Scenario: istanbul.summarizeCoverage() */
    .define("Given files have been instrumented and tests run", function test(done) {
      gulp.src(["Test_Resources/resources/lib/*.js"])
        .pipe(istanbul())
        .on("finish", function onFinish() {
          process.stdout.write = function stdoutWrite() {
          };
          gulp.src(["Test_Resources/resources/test/*.js"])
            .pipe(mocha({"reporter": "spec"}))
            .on("end", done);
        });
    })
    .define("When istanbul.summarizeCoverage is executed", function test(done) {
      process.stdout.write = out;
      this.world.data = istanbul.summarizeCoverage();
      done();
    })
    .define("Then statistics about the test run are returned", function test(done) {
      assert.equal(this.world.data.lines.pct, 75);
      assert.equal(this.world.data.statements.pct, 75);
      assert.equal(this.world.data.functions.pct, 50);
      assert.equal(this.world.data.branches.pct, 100);
      done();
    })/*Scenario: istanbul.registerReport() */
    .define("When istanbul.registerReport is executed", function test(done) {
      istanbul.registerReport(require("istanbul-reporter-clover-limits"));
      done();
    })
    .define("Then a custom report is registered", function test(done) {
      var invalid = _.difference(["clover-limits"], istanbul.istanbul().Report.getReportList());
      assert.ok(invalid);
      done();
    })/*Scenario: istanbul.writeReports() */
    .define("Given files have been instrumented", function test(done) {
      // set up coverage
      gulp.src(["Test_Resources/resources/lib/*.js"])
        .on("end", done)
        .pipe(istanbul());
    })
    .define("When istanbul.writeReports is executed", function test(done) {
      assert(true);
      done();
    })
    .define("Then coverage report is output to stdout", function test(done) {
      /*
       process.stdout.write = function (str) {
       if (str.indexOf("==== Coverage summary ====") >= 0) {
       done();
       }
       };
       */

      gulp.src(["Test_Resources/resources/test/*.js"])
        .pipe(mocha({"reporter": "spec"}))
        .pipe(istanbul.writeReports("Test_Resources/coverage"))
        .on("end", done);

    })
    .define("Then coverage report is output to file", function test(done) {
      /*
       process.stdout.write = function () {
       };
       */
      gulp.src(["Test_Resources/resources/test/*.js"])
        .pipe(mocha({"reporter": "spec"}))
        .pipe(istanbul.writeReports("Test_Resources/coverage"))
        .on("end", function onEnd() {
          assert(fs.existsSync("Test_Resources/coverage"));
          assert(fs.existsSync("Test_Resources/coverage/lcov.info"));
          assert(fs.existsSync("Test_Resources/coverage/coverage-final.json"));
          done();
        });
    })/*Scenario: istanbul.writeReports() with directory */
    .define("When istanbul.writeReports is executed with directory specified in the legacy way", function test(done) {
      assert(true);
      done();
    })
    .define("Then coverage report is output to specified directory", function test(done) {
      process.stdout.write = function stdoutWrite() {
      };
      gulp.src(["Test_Resources/resources/test/*.js"])
        .pipe(mocha({"reporter": "spec"}))
        .pipe(istanbul.writeReports("Test_Resources/coverage/cov-foo1"))
        .on("end", function onEnd() {
          assert(fs.existsSync("Test_Resources/coverage/cov-foo1"));
          assert(fs.existsSync("Test_Resources/coverage/cov-foo1/lcov.info"));
          assert(fs.existsSync("Test_Resources/coverage/cov-foo1/coverage-final.json"));
          done();
        });
    })
    .define("When istanbul.writeReports is executed with directory specified", function test(done) {
      assert(true);
      done();
    })
    /*Scenario: istanbul.writeReports() with specified reporter */
    .define("When istanbul.writeReports is executed with valid reporter specified", function test(done) {
      assert(true);
      done();
    })
    .define("Then coverage report is output using specified reporter", function test(done) {
      process.stdout.write = function stdOutWrite() {
      };
      gulp.src(["Test_Resources/resources/test/*.js"])
        .pipe(mocha({"reporter": "spec"}))
        .pipe(istanbul.writeReports({"dir": "Test_Resources/coverage/cov-foo2", "reporters": ["cobertura"]}))
        .on("end", function onEnd() {
          assert(fs.existsSync("Test_Resources/coverage/cov-foo2"));
          assert(!fs.existsSync("Test_Resources/coverage/cov-foo2/lcov.info"));
          assert(fs.existsSync("Test_Resources/coverage/cov-foo2/cobertura-coverage.xml"));
          process.stdout.write = out;
          done();
        });
    })
    .define("When istanbul.writeReports is executed with an invalid reporter specified", function test(done) {
      assert(true);
      done();
    })
    .define("Then an invalid reporter error is thrown", function test(done) {
      var actualErr;
      try {
        istanbul.writeReports({"reporters": ["not-a-valid-reporter"]});
      } catch (err) {
        actualErr = err;
      }
      assert.ok(actualErr.plugin === "gulp-istanbul");
      done();
    });
})();
