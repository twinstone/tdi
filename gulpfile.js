(function () {
	'use strict';

	/* global require: true */

	var gulp = require('gulp');
	var through = require('through2');
	var rimraf = require('gulp-rimraf');
	var concat = require('gulp-concat');
	var template = require('gulp-template');
	var uglify = require('gulp-uglify');
	var rename = require('gulp-rename');
	var qunit = require('gulp-qunit');
	var jshint = require('gulp-jshint');
	var jscs = require('gulp-jscs');
	var stylish = require('gulp-jscs-stylish');
	var eol = require('eol');
	var jsdoc = require('gulp-jsdoc3');

	var packageJson = require('./package.json');
	var rootFolder = './';
	var srcFolder = rootFolder + 'src/';
	var buildFolder = rootFolder + 'build/';
	var docApiFolder = rootFolder + 'docs/api/';
	var testFolder = rootFolder + 'tests/';
	var bundleName = 'tdi-bundle';

	gulp.task('cleanBuild', function () {
		return gulp.src(buildFolder, {read: false})
			.pipe(rimraf());
	});

	gulp.task('cleanDoc', function () {
		return gulp.src(docApiFolder, {read: false})
			.pipe(rimraf());
	});

	gulp.task('clean', gulp.parallel('cleanBuild', 'cleanDoc'));

	gulp.task('doc', gulp.series('cleanDoc', function () {
		return gulp.src(["./README-jsdoc.md", srcFolder + "*.js"], {read: false})
			.pipe(jsdoc({
				"tags": {
					"allowUnknownTags": true
				},
				"opts": {
					"destination": docApiFolder
				},
				"plugins": [
					"plugins/markdown"
				]
			}));
	}));

	gulp.task('bundle', function () {
		var files = [];

		files.push(rootFolder + 'banner.txt');
		files.push(srcFolder + 'polyfills/*.js');
		files.push(srcFolder + 'tdi.js');
		files.push(srcFolder + 'tdi-ajax.js');
		files.push(srcFolder + 'tdi-tools.js');

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

	gulp.task('release', gulp.series('bundle', 'minify', function () {
		return gulp.src([buildFolder + bundleName + '.js', buildFolder + bundleName + '.min.js'])
			.pipe(function () {
				return rename(function (path) {
					path.basename = path.basename.replace(bundleName, bundleName + '-' + packageJson.version);
				});
			}())
			.pipe(gulp.dest(buildFolder));
	}));

	gulp.task('prepare', gulp.series('cleanBuild', 'bundle', 'minify'));

	gulp.task('test', gulp.series('prepare', function () {
		return gulp.src(testFolder + '*.html')
			.pipe(qunit({timeout: 10}));
	}));

	gulp.task('lint', function () {
		return gulp.src(['./src/*.js', './tests/*.js'])
			.pipe(jshint())
			.pipe(jscs())
			.pipe(stylish.combineWithHintResults())
			.pipe(jshint.reporter('jshint-stylish'))
			.pipe(jshint.reporter('fail'));
	});

	gulp.task('build', gulp.series('lint', 'test', 'doc'));

	gulp.task('default', gulp.parallel('build'));
}());
