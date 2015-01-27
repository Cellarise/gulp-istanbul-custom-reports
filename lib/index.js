"use strict";

var through = require("through2").obj;
var path = require("path");
var gutil = require("gulp-util");
var _ = require("lodash");
var istanbul = require("istanbul");
var hook = istanbul.hook;
var Report = istanbul.Report;
var Collector = istanbul.Collector;
var PluginError = gutil.PluginError;

var PLUGIN_NAME = "gulp-istanbul";
var COVERAGE_VARIABLE = "$$cov_" + new Date().getTime() + "$$";

var plugin = module.exports = function gulpIstanbulCustomReports(opts) {
  var fileMap = {};
  var instrumenter;
  opts = opts || {};
  if (!opts.coverageVariable) {
    opts.coverageVariable = COVERAGE_VARIABLE;
  }

  hook.hookRequire(function hookRequireFileMap(filePath) {
    return !!fileMap[filePath];
  }, function hookRequireCallback(code, cbPath) {
    return fileMap[cbPath];
  });

  instrumenter = new istanbul.Instrumenter(opts);

  return through(function gulpIstanbulCustomReportsTransform(file, enc, cb) {
    if (!file.contents instanceof Buffer) {
      return cb(new PluginError(PLUGIN_NAME, "streams not supported"));
    }

    instrumenter.instrument(file.contents.toString(), file.path, function instrumentCallback(err, code) {
      if (!err) {
        file.contents = new Buffer(code);
      }

      fileMap[file.path] = file.contents.toString();

      return cb(err, file);
    });
  });
};

plugin.registerReport = function pluginRegisterReport(report) {
  return Report.register(report);
};

plugin.istanbul = function pluginIstanbul() {
  return istanbul;
};

plugin.summarizeCoverage = function pluginSummarizeCoverage(opts) {
  var collector;
  opts = opts || {};
  if (!opts.coverageVariable) {
    opts.coverageVariable = COVERAGE_VARIABLE;
  }

  if (!global[opts.coverageVariable]) {
    throw new Error("no coverage data found, run tests before calling `summarizeCoverage`");
  }

  collector = new Collector();
  collector.add(global[opts.coverageVariable]);
  return istanbul.utils.summarizeCoverage(collector.getFinalCoverage());
};

plugin.writeReports = function pluginWriteReports(opts) {
  var defaultDir, invalid, reporters, cover;
  if (typeof opts === "string") {
    opts = {"dir": opts};
  }
  opts = opts || {};

  defaultDir = path.join(process.cwd(), "coverage");
  opts = _.defaults(opts, {
    "coverageVariable": COVERAGE_VARIABLE,
    "dir": defaultDir,
    "reporters": ["lcov", "json", "text", "text-summary"],
    "reportOpts": {"dir": opts.dir || defaultDir}
  });

  invalid = _.difference(opts.reporters, Report.getReportList());
  if (invalid.length) {
    // throw before we start -- fail fast
    throw new PluginError(PLUGIN_NAME, "Invalid reporters: " + invalid.join(", "));
  }

  reporters = opts.reporters.map(function (r) {
    return Report.create(r, opts.reportOpts);
  });

  cover = through();

  cover.on("end", function () {
    var collector = new Collector();
    collector.add(global[opts.coverageVariable] || {}); //revert to an object if there are not macthing source files.
    reporters.forEach(function (report) {
      report.writeReport(collector, true);
    });
    delete global[opts.coverageVariable];
  }).resume();

  return cover;
};
