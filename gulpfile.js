const { src, dest, watch, series, parallel } = require('gulp');
const fileInclude = require('gulp-file-include');
const sass = require('gulp-sass')(require('sass'));
const cssnano = require('gulp-cssnano');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const rename = require('gulp-rename');
const clean = require('gulp-clean');

// ========== ШЛЯХИ ==========
const paths = {
  html: {
    src: 'src/app/*.html',
    components: 'src/app/components/**/*.html',
    dest: 'dist/'
  },
  scss: {
    src: 'src/app/scss/main.scss',
    watch: 'src/app/scss/**/*.scss',
    dest: 'dist/css/'
  },
  js: {
    src: 'src/app/js/**/*.js',
    dest: 'dist/js/'
  },
  imgs: {
    src: 'src/app/imgs/**/*',
    jpg: 'src/app/imgs/**/*.jpg',
    dest: 'dist/imgs/'
  },
  bootstrap: {
    css: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
    js: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js'
  }
};

// ========== ОЧИСТКА ==========
function cleanDist() {
  return src('dist', { allowEmpty: true, read: false })
    .pipe(clean());
}

// ========== HTML (file include) ==========
function html() {
  return src(paths.html.src)
    .pipe(fileInclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.reload({ stream: true }));
}

// ========== SCSS -> index.min.css ==========
function styles() {
  return src(paths.scss.src)
    .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(cssnano())
    .pipe(rename({ basename: 'index', suffix: '.min' }))
    .pipe(dest(paths.scss.dest))
    .pipe(browserSync.stream());
}

// ========== JS -> script.min.js ==========
function scripts() {
  return src(paths.js.src)
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(dest(paths.js.dest))
    .pipe(browserSync.reload({ stream: true }));
}

// ========== ЗОБРАЖЕННЯ: PNG та інші оптимізуються ==========
function images() {
  return src([paths.imgs.src, '!' + paths.imgs.jpg], { encoding: false })
    .pipe(imagemin())
    .pipe(dest(paths.imgs.dest))
    .pipe(browserSync.reload({ stream: true }));
}

// ========== ЗОБРАЖЕННЯ: JPG копіюються без змін ==========
function photos() {
  return src(paths.imgs.jpg, { encoding: false })
    .pipe(dest(paths.imgs.dest))
    .pipe(browserSync.reload({ stream: true }));
}

// ========== BOOTSTRAP ==========
function bootstrapCss() {
  return src(paths.bootstrap.css)
    .pipe(dest('dist/css/'));
}

function bootstrapJs() {
  return src(paths.bootstrap.js)
    .pipe(dest('dist/js/'));
}

// ========== SERVER ==========
function serve(done) {
  browserSync.init({
    server: { baseDir: 'dist' },
    notify: false,
    open: true
  });
  done();
}

// ========== WATCHER ==========
function watcher() {
  watch([paths.html.src, paths.html.components], html);
  watch(paths.scss.watch, styles);
  watch(paths.js.src, scripts);
  watch(paths.imgs.src, parallel(images, photos));
}

// ========== ЕКСПОРТ ==========
exports.clean = cleanDist;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.images = images;
exports.photos = photos;
exports.bootstrapCss = bootstrapCss;
exports.bootstrapJs = bootstrapJs;

exports.build = series(
  cleanDist,
  parallel(html, styles, scripts, images, photos, bootstrapCss, bootstrapJs)
);

exports.default = series(
  cleanDist,
  parallel(html, styles, scripts, images, photos, bootstrapCss, bootstrapJs),
  serve,
  watcher
);