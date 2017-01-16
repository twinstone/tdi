(function () {
	'use strict';

	/* global require: true */

	var gulp = require('gulp');
	var through = require('through2');
	var runSequence = require('run-sequence');
	var rimraf = require('gulp-rimraf');
	var concat = require('gulp-concat');
	var template = require('gulp-template');
	var uglify = require('gulp-uglify');
	var rename = require('gulp-rename');
	var yuidoc = require('gulp-yuidoc');
	var qunit = require('gulp-qunit');
	var jshint = require('gulp-jshint');
	var jscs = require('gulp-jscs');
	var stylish = require('gulp-jscs-stylish');
	var eol = require('eol');

	var packageJson = require('./package.json');
	var rootFolder = './';
	var srcFolder = rootFolder + 'src/';
	var buildFolder = rootFolder + 'build/';
	var docFolder = rootFolder + 'doc/api/';
	var docThemeFolder = rootFolder + 'docthemes';
	var testFolder = rootFolder + 'tests/';
	var bundleName = 'tdi-bundle';

	gulp.task('clean', ['cleanBuild', 'cleanDoc']);

	gulp.task('cleanBuild', function () {
		return gulp.src(buildFolder, {read: false})
			.pipe(rimraf());
	});

	gulp.task('cleanDoc', function () {
		return gulp.src(docFolder, {read: false})
			.pipe(rimraf());
	});

	gulp.task('bundle', [], function () {
		var files = [];

		files.push(rootFolder + 'banner.txt');
		files.push(srcFolder + 'js/tdi.js');
		files.push(srcFolder + 'js/tdi-ajax.js');
		files.push(srcFolder + 'js/tdi-tools.js');

		return gulp.src(files)
			.pipe(through.obj(function (file, enc, cb) {
				file.contents = new Buffer(eol.lf(file.contents.toString()));
				cb(null, file);
			}))
			.pipe(concat(bundleName + '.js'))
			.pipe(template({
				projectUrl: packageJson.homepage,
				productVersion: packageJson.version
			}))
			.pipe(gulp.dest(buildFolder));
	});

	gulp.task('minify', function () {
		return gulp.src(buildFolder + bundleName + '.js')
			.pipe(uglify({
				output: {
					comments: /^!/i
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

	gulp.task('copyDocTheme', function () {
		return gulp.src(docThemeFolder + '/default/**/*')
			.pipe(gulp.dest(docFolder));
	});

	gulp.task('doc', ['cleanDoc', 'copyDocTheme'], function () {
		return gulp.src(srcFolder + "js/*.js")
			.pipe(yuidoc())
			.pipe(gulp.dest(docFolder));
	});

	gulp.task('test', ['prepare'], function () {
		return gulp.src(testFolder + '*.html')
			.pipe(qunit({timeout: 10}));
	});

	gulp.task('prepare', function (callback) {
		runSequence('cleanBuild', 'bundle', 'minify', callback);
	});

	gulp.task('lint', function () {
		return gulp.src(['./src/**/*.js', './tests/*.js'])
			.pipe(jshint())
			.pipe(jscs())
			.pipe(stylish.combineWithHintResults())
			.pipe(jshint.reporter('jshint-stylish'))
			.pipe(jshint.reporter('fail'));
	});

	gulp.task('build', function () {
		runSequence('lint', 'test');
	});
	gulp.task('default', ['build']);
}());
