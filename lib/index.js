"use strict";

var through = require("through2").obj;
var path = require("path");
var istanbul = require("istanbul");
var gutil = require("gulp-util");
var _ = require("lodash");
var Report = istanbul.Report;
var Collector = istanbul.Collector;
var PluginError = gutil.PluginError;
var checker = require('istanbul-threshold-checker');

var PLUGIN_NAME = "gulp-istanbul";
var COVERAGE_VARIABLE = "$$cov_" + new Date().getTime() + "$$";

var plugin = module.exports = function (opts) {
  var instrumenter;
  opts = opts || {};
  _.defaults(opts, {
    "coverageVariable": COVERAGE_VARIABLE,
    "instrumenter": istanbul.Instrumenter
  });
  opts.includeUntested = opts.includeUntested === true;

  /* eslint new-cap:0 */
  instrumenter = new opts.instrumenter(opts);

  return through(function (file, enc, cb) {
    cb = _.once(cb);
    if (!(file.contents instanceof Buffer)) {
      return cb(new PluginError(PLUGIN_NAME, 'streams not supported'));
    }

    instrumenter.instrument(file.contents.toString(), file.path, function (err, code) {
      var instrumentedSrc, covStubRE, covStubMatch, covStub;
      if (err) {
        return cb(new PluginError(
          PLUGIN_NAME,
          'Unable to parse ' + file.path + '\n\n' + err.message + '\n'
        ));
      }

      file.contents = new Buffer(code);

      // Parse the blank coverage object from the instrumented file and save it
      // to the global coverage variable to enable reporting on non-required
      // files, a workaround for
      // https://github.com/gotwarlost/istanbul/issues/112
      if (opts.includeUntested) {
        instrumentedSrc = file.contents.toString();
        covStubRE = /\{.*"path".*"fnMap".*"statementMap".*"branchMap".*\}/g;
        covStubMatch = covStubRE.exec(instrumentedSrc);
        if (covStubMatch !== null) {
          covStub = JSON.parse(covStubMatch[0]);
          global[opts.coverageVariable] = global[opts.coverageVariable] || {};
          global[opts.coverageVariable][path.resolve(file.path)] = covStub;
        }
      }

      return cb(err, file);
    });
  });
};

plugin.hookRequire = function (options) {
  var fileMap = {};

  istanbul.hook.unhookRequire();
  istanbul.hook.hookRequire(function (path2) {
    return !!fileMap[path2];
  }, function (code, path2) {
    return fileMap[path2];
  }, options);

  return through(function (file, enc, cb) {
    // If the file is already required, delete it from the cache otherwise the covered
    // version will be ignored.
    delete require.cache[path.resolve(file.path)];
    fileMap[file.path] = file.contents.toString();
    return cb();
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

  reporters = opts.reporters.map(function(reporter) {
    if (reporter.TYPE) {
      Report.register(reporter);
    }
    return reporter.TYPE || reporter;
  });

  invalid = _.difference(reporters, Report.getReportList());
  if (invalid.length) {
    // throw before we start -- fail fast
    throw new PluginError(PLUGIN_NAME, "Invalid reporters: " + invalid.join(", "));
  }

  reporters = reporters.map(function (r) {
    return Report.create(r, _.clone(opts.reportOpts));
  });

  cover = through();

  cover.on("end", function () {
    var collector = new Collector();
    //revert to an object if there are not macthing source files.
    collector.add(global[opts.coverageVariable] || {});
    reporters.forEach(function (report) {
      report.writeReport(collector, true);
    });
    //delete global[opts.coverageVariable];
  }).resume();

  return cover;
};

plugin.enforceThresholds = function (opts) {
  var cover = through();
  opts = opts || {};
  opts = _.defaults(opts, {
    "coverageVariable": COVERAGE_VARIABLE
  });

  cover.on('end', function () {
    var results, criteria;
    var collector = new Collector();

    // Revert to an object if there are no macthing source files.
    collector.add(global[opts.coverageVariable] || {});

    results = checker.checkFailures(opts.thresholds, collector.getFinalCoverage());
    criteria = function(type) {
      return type.global && type.global.failed
        || type.each && type.each.failed;
    };

    if (_.any(results, criteria)) {
      this.emit('error', new PluginError({
        "plugin": PLUGIN_NAME,
        "message": 'Coverage failed'
      }));
    }

  }).resume();

  return cover;
};
