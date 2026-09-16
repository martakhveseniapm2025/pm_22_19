const { src, dest, watch, series, parallel } = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const csso = require('gulp-csso');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const browserSync = require('browser-sync').create();

function html() {
  return src('src/app/index.html')
    .pipe(fileInclude())
    .pipe(dest('dist'))
    .pipe(browserSync.stream());
}

function styles() {
  return src('src/app/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(csso())
    .pipe(dest('dist/css'))
    .pipe(browserSync.stream());
}

function scripts() {
  return src('src/app/js/**/*.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('dist/js'))
    .pipe(browserSync.stream());
}

function images() {
  return src('src/app/imgs/**/*')
    .pipe(dest('dist/imgs'))
    .pipe(browserSync.stream());
}

function serve() {
  browserSync.init({
    server: {
      baseDir: './dist'
    }
  });

  watch('src/app/**/*.html', html);
  watch('src/app/scss/**/*.scss', styles);
  watch('src/app/js/**/*.js', scripts);
  watch('src/app/imgs/**/*', images);
}

exports.default = series(
  parallel(html, styles, scripts, images),
  serve
);