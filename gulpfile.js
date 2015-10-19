(function () {
	'use strict';

	/* global require: true */

	var gulp        = require('gulp');
	var runSequence = require('run-sequence');
	var rimraf      = require('gulp-rimraf');
	var concat      = require('gulp-concat');
	var template    = require('gulp-template');
	var uglify      = require('gulp-uglify');
	var rename      = require('gulp-rename');
	var yuidoc      = require('gulp-yuidoc');
	var qunit       = require('gulp-qunit');

	var packageJson = require('./package.json');
	var rootFolder  = './';
	var srcFolder   = rootFolder + 'src/';
	var buildFolder = rootFolder + 'build/';
	var docFolder   = rootFolder + 'doc/';
	var testFolder  = rootFolder + 'tests/';
	var bundleName  = 'tdi-bundle';

	gulp.task('clean', function () {
		return gulp.src([buildFolder, docFolder], {read : false})
			.pipe(rimraf());
	});

	gulp.task('bundle', [], function () {
		var files = [];

		files.push(rootFolder + 'banner.txt');
		files.push(srcFolder + 'js/tdi.js');
		files.push(srcFolder + 'js/tdi-ajax.js');
		files.push(srcFolder + 'js/tdi-tools.js');

		return gulp.src(files)
			.pipe(concat(bundleName + '.js'))
			.pipe(template({
				projectUrl     : packageJson.homepage,
				productVersion : packageJson.version
			}))
			.pipe(gulp.dest(buildFolder));
	});

	gulp.task('minify', function () {
		return gulp.src(buildFolder + bundleName + '.js')
			.pipe(uglify({
				output : {
					comments : /^!/i
				}
			}))
			.pipe(function () {
				return rename(function (path) {
					path.basename = bundleName + '.min';
				});
			}())
			.pipe(gulp.dest(buildFolder));
	});

	gulp.task('release', ['bundle', 'minify'], function () {
		return gulp.src([buildFolder + bundleName + '.js', buildFolder + bundleName + '.min.js'])
			.pipe(function () {
				return rename(function (path) {
					path.basename = path.basename.replace(bundleName, bundleName + '-' + packageJson.version);
				});
			}())
			.pipe(gulp.dest(buildFolder));
	});

	gulp.task('doc', function () {
		return gulp.src(srcFolder + "js/*.js")
			.pipe(yuidoc())
			.pipe(gulp.dest(docFolder));
	});

	gulp.task('test', function () {
		return gulp.src(testFolder + '*.html')
			.pipe(qunit({timeout : 10}));
	});

	gulp.task('build', ['test'], function () {
		runSequence('clean', 'bundle', 'minify', 'doc');
	});
	gulp.task('default', ['build']);
}());
