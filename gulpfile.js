'use strict';

var gulp = require('gulp'),
  connect = require('gulp-connect'),
  sass = require('gulp-sass'),
  rename = require('gulp-rename');

require('require-dir')('./gulp');

gulp.task('connect', function () {
  connect.server({
    root: 'app',
    livereload: true,
    port: 9000
  });
});

gulp.task('sass', function () {
  gulp.src('./app/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./app/css'));
});

gulp.task('partials', function () {
  gulp.src('./app/partials/**/*.html')
    .pipe(gulp.dest('dist/partials'));
});

gulp.task('components', function () {
  gulp.src('./app/components/**/*.html')
    .pipe(gulp.dest('dist/components'));
});


gulp.task('settings', function () {
  gulp.src('./settings/production.json')
    .pipe(rename('settings.json'))
    .pipe(gulp.dest('dist/'));
});

gulp.task('watch', ['connect'], function () {

  gulp.watch('./app/scss/**/*.scss', ['sass']);

  // Watch .html files
  gulp.watch('app/**/*.html');

  // Watch .js files
  gulp.watch('app/scripts/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch('app/images/**/*', ['images']);
});

gulp.task('build', ['sass', 'html','styles','images','fonts','partials','components', 'settings']);

gulp.task('default', ['connect', 'watch'], function () {
  gulp.start('build');
});

