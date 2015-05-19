# gulp-istanbul-custom-reports
[![view on npm](http://img.shields.io/npm/v/gulp-istanbul-custom-reports.svg?style=flat)](https://www.npmjs.org/package/gulp-istanbul-custom-reports)
[![npm module downloads per month](http://img.shields.io/npm/dm/gulp-istanbul-custom-reports.svg?style=flat)](https://www.npmjs.org/package/gulp-istanbul-custom-reports)
[![Dependency status](https://david-dm.org/Cellarise/gulp-istanbul-custom-reports.svg?style=flat)](https://david-dm.org/Cellarise/gulp-istanbul-custom-reports)
[![Coverage](https://img.shields.io/badge/coverage-71%25_skipped:0%25-yellow.svg?style=flat)](https://www.npmjs.org/package/gulp-istanbul-custom-reports)

> Forked from SBoudrias/gulp-Istanbul - Istanbul unit test coverage plugin for gulp with the ability to register a custom Istanbul report implementation.



Works on top of any Node.js unit test framework.

Installation
---------------

```shell
npm install --save-dev gulp-istanbul
```

Example
---------------

In your `gulpfile.js`:

#### Node.js testing

```javascript
var istanbul = require('gulp-istanbul');
// We'll use mocha here, but any test framework will work
var mocha = require('gulp-mocha');

gulp.task('test', function (cb) {
  gulp.src(['lib/**/*.js', 'main.js'])
    .pipe(istanbul()) // Covering files
    .pipe(istanbul.hookRequire()) // Force `require` to return covered files
    .on('finish', function () {
      gulp.src(['test/*.js'])
        .pipe(mocha())
        .pipe(istanbul.writeReports()) // Creating the reports after tests runned
        .pipe(istanbul.enforceThresholds({ thresholds: { global: 90 } })) // Enforce a coverage of at least 90%
        .on('end', cb);
    });
});
```

#### Browser testing

For browser testing, you'll need to write the files covered by istanbul in a directory from where you'll serve these files to the browser running the test. You'll also need a way to extract the value of the [coverage variable](#coveragevariable) after the test have runned in the browser.

Browser testing is hard. If you're not sure what to do, then I suggest you take a look at [Karma test runner](http://karma-runner.github.io) - it has built-in coverage using Istanbul.


```javascript
var istanbul = require('gulp-istanbul');

gulp.task('test', function (cb) {
  gulp.src(['lib/**/*.js', 'main.js'])
  .pipe(istanbul()) // Covering files
  .pipe(gulp.dest('test-tmp/'))
  .on('finish', function () {
    gulp.src(['test/*.html'])
    .pipe(testFramework())
    .pipe(istanbul.writeReports()) // Creating the reports after tests runned
    .on('end', cb);
  });
});
```

API
--------------

### istanbul(opt)

Instrument files passed in the stream.

#### opt
Type: `Object` (optional)
```js
{
  coverageVariable: 'someVariable',
  ...other Instrumeter options...
}
```

##### coverageVariable
Type: `String` (optional)
Default: `'$$cov_' + new Date().getTime() + '$$'`

The global variable istanbul uses to store coverage

See also:
- [istanbul coverageVariable][istanbul-coverage-variable]
- [SanboxedModule][sandboxed-module-coverage-variable]

##### includeUntested
Type: `Boolean` (optional)
Default: `false`

Flag to include test coverage of files that aren't `require`d by any tests

See also:
- [istanbul "0% coverage" issue](https://github.com/gotwarlost/istanbul/issues/112)

##### instrumenter
Type: `Instrumenter` (optional)
Default: `istanbul.Instrumenter`

Custom Instrumenter to be used instead of the default istanbul one.

```js
var isparta = require('isparta');
var istanbul = require('gulp-istanbul');

gulp.src('lib/**.js')
  .pipe(istanbul({
    instrumenter: isparta.Instrumenter
  }));
```

See also:
- [isparta](https://github.com/douglasduteil/isparta)

##### Other Istanbul Instrumenter options

See:
- [istanbul Instrumenter documentation][istanbul-coverage-variable]

### istanbul.hookRequire()

Overwrite `require` so it returns the covered files. The method take an optional [option object](https://gotwarlost.github.io/istanbul/public/apidocs/classes/Hook.html#method_hookRequire).

Always use this option if you're running tests in Node.js

### istanbul.summarizeCoverage(opt)

get coverage summary details

#### opt
Type: `Object` (optional)
```js
{
  coverageVariable: 'someVariable'
}
```
##### coverageVariable
Type: `String` (optional)
Default: `'$$cov_' + new Date().getTime() + '$$'`

The global variable istanbul uses to store coverage

See also:
- [istanbul coverageVariable][istanbul-coverage-variable]
- [SanboxedModule][sandboxed-module-coverage-variable]

#### returns
Type: `Object`
```js
{
  lines: { total: 4, covered: 2, skipped: 0, pct: 50 },
  statements: { total: 4, covered: 2, skipped: 0, pct: 50 },
  functions: { total: 2, covered: 0, skipped: 0, pct: 0 },
  branches: { total: 0, covered: 0, skipped: 0, pct: 100 }
}
```

See also:
- [istanbul utils.summarizeCoverage()][istanbul-summarize-coverage]


### istanbul.writeReports(opt)

Create the reports on stream end.

#### opt
Type: `Object` (optional)
```js
{
  dir: './coverage',
  reporters: [ 'lcov', 'json', 'text', 'text-summary', CustomReport ],
  reportOpts: { dir: './coverage' },
  coverageVariable: 'someVariable'
}
```

##### dir
Type: `String` (optional)
Default: `./coverage`

The folder in which the reports are to be outputted.

##### reporters
Type: `Array` (optional)
Default: `[ 'lcov', 'json', 'text', 'text-summary' ]`

The list of available reporters:
- `clover`
- `cobertura`
- `html`
- `json`
- `lcov`
- `lcovonly`
- `none`
- `teamcity`
- `text`
- `text-summary`

You can also specify one or more custom reporter objects as items in the array. These will be automatically registered with istanbul.

See also `require('istanbul').Report.getReportList()`

##### coverageVariable
Type: `String` (optional)
Default: `'$$cov_' + new Date().getTime() + '$$'`

The global variable istanbul uses to store coverage

See also:
- [istanbul coverageVariable][istanbul-coverage-variable]
- [SanboxedModule][sandboxed-module-coverage-variable]


### istanbul.enforceThresholds(opt)

Checks coverage against minimum acceptable thresholds. Fails the build if any of the thresholds are not met.

#### opt
Type: `Object` (optional)
```js
{
  coverageVariable: 'someVariable',
  thresholds: {
    global: 60,
    each: -10
  }
}
```

##### coverageVariable
Type: `String` (optional)
Default: `'$$cov_' + new Date().getTime() + '$$'`

The global variable istanbul uses to store coverage


##### thresholds
Type: `Object` (required)

Minimum acceptable coverage thresholds. Any coverage values lower than the specified threshold will fail the build.

Each threshold value can be:
- A positive number - used as a percentage
- A negative number - used as the maximum amount of coverage gaps
- A falsey value will skips the coverage

Thresholds can be specified across all files (`global`) or per file (`each`):
```
{
  global: 80,
  each: 60
}
```

You can also specify a value for each metric:
```
{
  global: {
    statements: 80,
    branches: 90,
    lines: 70,
    functions: -10
  }
  each: {
    statements: 100,
    branches: 70,
    lines: -20
  }
}
```

#### emits

A plugin error in the stream if the coverage fails

License
------------

[MIT License](http://en.wikipedia.org/wiki/MIT_License) (c) Simon Boudrias - 2013 - modified by John Barry

[istanbul]: http://gotwarlost.github.io/istanbul/
[gulp]: https://github.com/gulpjs/gulp

[npm-url]: https://npmjs.org/package/gulp-istanbul
[npm-image]: https://badge.fury.io/js/gulp-istanbul.png

[travis-url]: http://travis-ci.org/SBoudrias/gulp-istanbul
[travis-image]: https://secure.travis-ci.org/SBoudrias/gulp-istanbul.png?branch=master

[depstat-url]: https://david-dm.org/SBoudrias/gulp-istanbul
[depstat-image]: https://david-dm.org/SBoudrias/gulp-istanbul.png

[istanbul-coverage-variable]: http://gotwarlost.github.io/istanbul/public/apidocs/classes/Instrumenter.html
[istanbul-summarize-coverage]: http://gotwarlost.github.io/istanbul/public/apidocs/classes/ObjectUtils.html#method_summarizeCoverage
[sandboxed-module-coverage-variable]: https://github.com/felixge/node-sandboxed-module/blob/master/lib/sandboxed_module.js#L240



## API
*documented by [jsdoc-to-markdown](https://github.com/75lb/jsdoc-to-markdown)*.


#Changelog

<table style="width:100%;border-spacing:0px;border-collapse:collapse;margin:0px;padding:0px;border-width:0px;">
  <tr>
    <th style="width:20px;text-align:center;"></th>
    <th style="width:80px;text-align:center;">Type</th>
    <th style="width:80px;text-align:left;">ID</th>
    <th style="text-align:left;">Summary</th>
  </tr>
    
<tr>
        <td colspan=4><strong>Version: 0.2.0 - released 2015-05-20</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-16</td>
            <td>Package: Update package dependencies</td>
          </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-18</td>
            <td>Package: Update to v0.9.0 SBoudrias/gulp-istanbul</td>
          </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10403&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Bug</td>
            <td style="width:80px;text-align:left;">MDGULIST-17</td>
            <td>Package: Fix test failure due to istanbul hookRequire() being called twice</td>
          </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-15</td>
            <td>Package: Update eslint configuration, test.js runner and dev dependencies</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.8 - released 2015-01-28</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-14</td>
            <td>Package: Update package dependencies</td>
          </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-13</td>
            <td>Package: Update eslint configuration, test.js runner and dev dependencies</td>
          </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-12</td>
            <td>Package: Migrate from jshint to eslint static code analysis</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.7 - released 2014-10-12</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-10</td>
            <td>Package: Update package dependencies</td>
          </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-9</td>
            <td>Package: Remove all gulp tasks except &#39;test&#39; and update readme docs</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.6 - released 2014-10-09</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-8</td>
            <td>Package: Fix code-coverage reporting error on readme.md</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.5 - released 2014-10-09</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-7</td>
            <td>Package: Update package dependencies</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.4 - released 2014-10-09</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-6</td>
            <td>Package: Update package dependencies</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.3 - released 2014-08-28</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-5</td>
            <td>Package: Update dependencies.</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.2 - released 2014-08-27</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10419&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Non-functional</td>
            <td style="width:80px;text-align:left;">MDGULIST-4</td>
            <td>Package: Migrate to new Cellarise Package Manager.</td>
          </tr>
        
    
<tr>
        <td colspan=4><strong>Version: 0.1.1 - released 2014-08-20</strong></td>
      </tr>
        
<tr>
            <td style="width:20px;padding:0;margin:0;text-align:center;"><img src="https://jira.cellarise.com:80/secure/viewavatar?size=xsmall&amp;avatarId=10411&amp;avatarType=issuetype"/></td>
            <td style="width:80px;text-align:left;">Feature</td>
            <td style="width:80px;text-align:left;">MDGULIST-2</td>
            <td>Package: Add register report function.</td>
          </tr>
        
    
</table>



# License

MIT License (MIT). All rights not explicitly granted in the license are reserved.

Copyright (c) 2015 John Barry
## Dependencies
[abbrev@1.0.5](&quot;http://github.com/isaacs/abbrev-js&quot;) - &quot;MIT&quot;, [amdefine@0.1.0](&quot;https://github.com/jrburke/amdefine&quot;) - [&quot;BSD&quot;,&quot;MIT&quot;], [ansi-regex@1.1.1](&quot;https://github.com/sindresorhus/ansi-regex&quot;) - &quot;MIT&quot;, [ansi-styles@2.0.1](&quot;https://github.com/sindresorhus/ansi-styles&quot;) - &quot;MIT&quot;, [argparse@1.0.2](&quot;https://github.com/nodeca/argparse&quot;) - &quot;MIT&quot;, [array-differ@1.0.0](&quot;https://github.com/sindresorhus/array-differ&quot;) - &quot;MIT&quot;, [array-uniq@1.0.2](&quot;https://github.com/sindresorhus/array-uniq&quot;) - &quot;MIT&quot;, [async@0.2.10](&quot;https://github.com/caolan/async&quot;) - [&quot;MIT&quot;], [async@0.9.2](&quot;git+https://github.com/caolan/async&quot;) - &quot;MIT&quot;, [beeper@1.0.0](&quot;https://github.com/sindresorhus/beeper&quot;) - &quot;MIT&quot;, [camelcase-keys@1.0.0](&quot;https://github.com/sindresorhus/camelcase-keys&quot;) - &quot;MIT&quot;, [camelcase@1.0.2](&quot;https://github.com/sindresorhus/camelcase&quot;) - &quot;MIT&quot;, [chalk@1.0.0](&quot;https://github.com/sindresorhus/chalk&quot;) - &quot;MIT&quot;, [clone-stats@0.0.1](&quot;https://github.com/hughsk/clone-stats&quot;) - &quot;MIT&quot;, [clone@0.2.0](&quot;https://github.com/pvorb/node-clone&quot;) - &quot;MIT&quot;, [core-util-is@1.0.1](&quot;https://github.com/isaacs/core-util-is&quot;) - &quot;MIT&quot;, [dateformat@1.0.11](&quot;https://github.com/felixge/node-dateformat&quot;) - &quot;MIT&quot;, [deep-is@0.1.3](&quot;http://github.com/thlorenz/deep-is&quot;) - &quot;MIT&quot;, [duplexer2@0.0.2](&quot;https://github.com/deoxxa/duplexer2&quot;) - &quot;BSD&quot;, [escape-string-regexp@1.0.3](&quot;https://github.com/sindresorhus/escape-string-regexp&quot;) - &quot;MIT&quot;, [escodegen@1.6.1](&quot;http://github.com/estools/escodegen&quot;) - [&quot;BSD&quot;], [esprima@1.2.5](&quot;http://github.com/ariya/esprima&quot;) - [&quot;BSD&quot;], [esprima@2.1.0](&quot;https://github.com/jquery/esprima&quot;) - [&quot;BSD&quot;], [esprima@2.2.0](&quot;https://github.com/jquery/esprima&quot;) - [&quot;BSD&quot;], [estraverse@1.9.3](&quot;http://github.com/estools/estraverse&quot;) - [&quot;BSD&quot;], [esutils@1.1.6](&quot;http://github.com/Constellation/esutils&quot;) - [&quot;BSD&quot;], [fast-levenshtein@1.0.6](&quot;https://github.com/hiddentao/fast-levenshtein&quot;) - &quot;MIT&quot;, [fileset@0.1.5](&quot;https://github.com/mklabs/node-fileset&quot;) - [&quot;MIT&quot;], [get-stdin@4.0.1](&quot;https://github.com/sindresorhus/get-stdin&quot;) - &quot;MIT&quot;, [glob@3.2.11](&quot;https://github.com/isaacs/node-glob&quot;) - &quot;BSD&quot;, [gulp-istanbul-custom-reports@0.0.0](&quot;https://github.com/Cellarise/gulp-istanbul-custom-reports&quot;) - &quot;MIT License (MIT)&quot;, [gulp-util@3.0.4](&quot;https://github.com/wearefractal/gulp-util&quot;) - [&quot;MIT&quot;], [handlebars@3.0.0](&quot;https://github.com/wycats/handlebars.js&quot;) - &quot;MIT&quot;, [has-ansi@1.0.3](&quot;https://github.com/sindresorhus/has-ansi&quot;) - &quot;MIT&quot;, [indent-string@1.2.1](&quot;https://github.com/sindresorhus/indent-string&quot;) - &quot;MIT&quot;, [inherits@2.0.1](&quot;https://github.com/isaacs/inherits&quot;) - &quot;ISC&quot;, [is-finite@1.0.0](&quot;https://github.com/sindresorhus/is-finite&quot;) - &quot;MIT&quot;, [isarray@0.0.1](&quot;https://github.com/juliangruber/isarray&quot;) - &quot;MIT&quot;, [istanbul-threshold-checker@0.1.0](&quot;https://github.com/peterjwest/istanbul-threshold-checker&quot;) - &quot;MIT&quot;, [istanbul@0.3.14](&quot;https://github.com/gotwarlost/istanbul&quot;) - &quot;BSD-3-Clause&quot;, [js-yaml@3.3.1](&quot;https://github.com/nodeca/js-yaml&quot;) - &quot;MIT&quot;, [levn@0.2.5](&quot;https://github.com/gkz/levn&quot;) - [&quot;MIT&quot;], [lodash._basecopy@3.0.0](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash._basetostring@3.0.0](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash._basevalues@3.0.0](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash._isiterateecall@3.0.5](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash._reescape@3.0.0](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash._reevaluate@3.0.0](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash._reinterpolate@3.0.0](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash.escape@3.0.0](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash.isarguments@3.0.1](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash.isarray@3.0.1](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash.isnative@3.0.1](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash.keys@3.0.5](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash.restparam@3.6.0](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash.template@3.4.0](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash.templatesettings@3.1.0](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lodash@3.6.0](&quot;https://github.com/lodash/lodash&quot;) - &quot;MIT&quot;, [lru-cache@2.6.4](&quot;https://github.com/isaacs/node-lru-cache&quot;) - &quot;ISC&quot;, [map-obj@1.0.0](&quot;https://github.com/sindresorhus/map-obj&quot;) - &quot;MIT&quot;, [meow@3.1.0](&quot;https://github.com/sindresorhus/meow&quot;) - &quot;MIT&quot;, [minimatch@0.3.0](&quot;https://github.com/isaacs/minimatch&quot;) - &quot;MIT&quot;, [minimist@0.0.10](&quot;https://github.com/substack/minimist&quot;) - &quot;MIT&quot;, [minimist@0.0.8](&quot;https://github.com/substack/minimist&quot;) - &quot;MIT&quot;, [minimist@1.1.1](&quot;https://github.com/substack/minimist&quot;) - &quot;MIT&quot;, [mkdirp@0.5.1](&quot;git+https://github.com/substack/node-mkdirp&quot;) - &quot;MIT&quot;, [multipipe@0.1.2](&quot;https://github.com/juliangruber/multipipe&quot;) - &quot;MIT&quot;, [nopt@3.0.2](&quot;git+ssh://git@github.com/isaacs/nopt&quot;) - &quot;ISC&quot;, [object-assign@2.0.0](&quot;https://github.com/sindresorhus/object-assign&quot;) - &quot;MIT&quot;, [once@1.3.2](&quot;https://github.com/isaacs/once&quot;) - &quot;ISC&quot;, [optimist@0.3.7](&quot;http://github.com/substack/node-optimist&quot;) - &quot;MIT/X11&quot;, [optimist@0.6.1](&quot;http://github.com/substack/node-optimist&quot;) - &quot;MIT/X11&quot;, [optionator@0.5.0](&quot;https://github.com/gkz/optionator&quot;) - [&quot;MIT&quot;], [prelude-ls@1.1.2](&quot;https://github.com/gkz/prelude-ls&quot;) - [&quot;MIT&quot;], [readable-stream@1.0.33](&quot;https://github.com/isaacs/readable-stream&quot;) - &quot;MIT&quot;, [readable-stream@1.1.13](&quot;https://github.com/isaacs/readable-stream&quot;) - &quot;MIT&quot;, [repeating@1.1.2](&quot;https://github.com/sindresorhus/repeating&quot;) - &quot;MIT&quot;, [replace-ext@0.0.1](&quot;https://github.com/wearefractal/replace-ext&quot;) - [&quot;MIT&quot;], [resolve@1.1.6](&quot;https://github.com/substack/node-resolve&quot;) - &quot;MIT&quot;, [sigmund@1.0.0](&quot;https://github.com/isaacs/sigmund&quot;) - &quot;BSD&quot;, [source-map@0.1.43](&quot;http://github.com/mozilla/source-map&quot;) - [&quot;BSD&quot;], [sprintf-js@1.0.2](&quot;https://github.com/alexei/sprintf.js&quot;) - &quot;BSD-3-Clause&quot;, [string_decoder@0.10.31](&quot;https://github.com/rvagg/string_decoder&quot;) - &quot;MIT&quot;, [strip-ansi@2.0.1](&quot;https://github.com/sindresorhus/strip-ansi&quot;) - &quot;MIT&quot;, [supports-color@1.3.1](&quot;https://github.com/sindresorhus/supports-color&quot;) - &quot;MIT&quot;, [through2@0.6.5](&quot;https://github.com/rvagg/through2&quot;) - &quot;MIT&quot;, [type-check@0.3.1](&quot;https://github.com/gkz/type-check&quot;) - [&quot;MIT&quot;], [uglify-js@2.3.6](&quot;https://github.com/mishoo/UglifyJS2&quot;) - &quot;MIT*&quot;, [vinyl@0.4.6](&quot;https://github.com/wearefractal/vinyl&quot;) - [&quot;MIT&quot;], [which@1.0.9](&quot;https://github.com/isaacs/node-which&quot;) - &quot;ISC&quot;, [wordwrap@0.0.3](&quot;https://github.com/substack/node-wordwrap&quot;) - &quot;MIT&quot;, [wrappy@1.0.1](&quot;https://github.com/npm/wrappy&quot;) - &quot;ISC&quot;, [xtend@4.0.0](&quot;https://github.com/Raynos/xtend&quot;) - [&quot;MIT&quot;], 
*documented by [npm-licenses](http://github.com/AceMetrix/npm-license.git)*.