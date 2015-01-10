'use strict';

var gulp = require('gulp'),
  connect = require('gulp-connect'),
  sass = require('gulp-sass'),
  rename = require('gulp-rename'),
  htmlreplace = require('gulp-html-replace');

require('require-dir')('./gulp');

gulp.task('connect', function () {
  connect.server({
    root: 'app',
    livereload: true,
    port: 9000
  });
});

//     <!--build:basehref  -->
//<base href="/journal-staging/"/>
//  <!-- endbuild -->

//gulp.task('basehref', function () {
//  gulp.src('app/basehref/index.html')
//    .pipe(htmlreplace({
//      basehref: {
//        src: '/journal-staging/',
//        tpl: '<base href="%s"></base>'
//      }
//    }))
//    .pipe(gulp.dest('app/'));
//});

gulp.task('sass', function () {
  gulp.src('./app/scss/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('./app/css'));
});

gulp.task('partials', function () {
  gulp.src('./app/partials/**/*.html')
    .pipe(gulp.dest('dist/partials'));
});

gulp.task('images', function () {
  gulp.src('./app/images/**/*')
    .pipe(gulp.dest('dist/images'));
});


gulp.task('components', function () {
  gulp.src('./app/components/**/*.html')
    .pipe(gulp.dest('dist/components'));
});


gulp.task('settings-staging', function () {
  gulp.src('./settings/staging.json')
    .pipe(rename('settings.json'))
    .pipe(gulp.dest('dist/'));
  gulp.src('app/auth0-variables.js')
    .pipe(gulp.dest('dist/'));
});

gulp.task('settings-production', function () {
  gulp.src('./settings/production.json')
    .pipe(rename('settings.json'))
    .pipe(gulp.dest('dist/'));
  gulp.src('app/auth0-variables.js')
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

gulp.task('build', ['sass', 'html', 'styles', 'images', 'fonts', 'partials', 'components']);

gulp.task('default', ['connect', 'watch'], function () {
  gulp.start('build');
});

