'use strict';

var gulp = require('gulp'),
  connect = require('gulp-connect'),
  sass = require('gulp-sass');

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

gulp.task('watch', ['connect'], function () {

  gulp.watch('./app/scss/**/*.scss', ['sass']);

  // Watch .html files
  gulp.watch('app/*.html');

  // Watch .js files
  gulp.watch('app/scripts/**/*.js', ['scripts']);

  // Watch image files
  gulp.watch('app/images/**/*', ['images']);
});

gulp.task('default', ['connect', 'watch'], function () {
  gulp.start('build');
});

