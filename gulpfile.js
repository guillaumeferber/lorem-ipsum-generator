const { src, dest, parallel, watch, series } = require('gulp');

const connect = require('gulp-connect');
const open = require('gulp-open');
// CSS-Sass
const sass = require('gulp-sass');
const nano = require('gulp-cssnano');
const uncss = require('gulp-uncss');
// JS
const concat = require('gulp-concat');
var uglify = require('gulp-uglify');
// HTML
const htmlValidator = require('gulp-w3c-html-validator');
const prettify = require('gulp-html-prettify');
const extender = require('gulp-html-extend');

const del = require('del');
const configuration = {
  environment: 'develop',
  extension: {
    html: '.html',
    sass: '.scss',
    css: '.css',
    js: '.js'
  },
  configFiles: [
    './service-worker.js',
    './manifest.json',
    './scripts/recipes.json',
  ],
  assets: {
    directory: {
      root: 'assets/',
      images: 'assets/images',
    },
    js: [
      "node_modules/bootstrap/dist/js/bootstrap.min.js",
      'scripts/**/*.js'
    ],
    css: [
      "node_modules/bootstrap/scss/bootstrap.scss",
      'styles/styles.scss'
    ]
  },
  folders: {
    src: {
      html: 'html/',
      css: 'styles/',
      js: 'scripts/'
    },
    dest: './dist/'
  },
  server: {
    port: 8001
  }
};

const connectServer = () => {
  return connect.server({
    root: 'dist',
    port: configuration.server.port,
    livereload: true
  });
}
const openServer = () => {
  return src('dist/index.html')
    .pipe(open({uri: 'http://localhost:' + configuration.server.port + '/'}));
}

const copyFolder = () => {
  return src([configuration.assets.directory.root + '**/*']).pipe(dest(configuration.folders.dest + 'assets'));
}

const html = {
  validate() {
    return src(configuration.folders.dest + '**/*' + configuration.extension.html)
      .pipe(htmlValidator({skipWarnings: true}))
      .pipe(htmlValidator.reporter())
      .pipe(connect.reload());
  },
  prettify() {
    return src(configuration.folders.dest + '*' + configuration.extension.html)
    .pipe(prettify({indent_char: ' ', indent_size: 2}))
    .pipe(dest(configuration.folders.dest))
    .pipe(connect.reload());
  },
  extend() {
    return src(configuration.folders.src.html + '**/*' + configuration.extension.html)
        .pipe(extender({annotations:true,verbose:false, root: './'})) // default options
        .pipe(dest(configuration.folders.dest))
        .pipe(connect.reload());
  },
  htmlClean() {
    return del([
      `${configuration.folders.dest}base`,
      `${configuration.folders.dest}components`
    ]);
  },
  destClean() {
    return del([
      `${configuration.folders.dest}/**/*`
    ]);
  }
}

const css = () => {
  return src(configuration.assets.css)
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(concat('style.min' + configuration.extension.css))
    .pipe(nano())
    .pipe(dest(configuration.folders.dest))
    .pipe(connect.reload());
}

const unCss = () => {
  return src(configuration.folders.dest + 'style.min' + configuration.extension.css)
  .pipe(uncss({
    html: [configuration.folders.dest + '/**/*.html']
  }))
  .pipe(nano())
  .pipe(dest(configuration.folders.dest))
}

const js = () => {
  return src(configuration.assets.js)
    .pipe(concat('app.min' + configuration.extension.js))
    .pipe(uglify())
    .pipe(dest(configuration.folders.dest ))
    .pipe(connect.reload());
}

const watchAssets = () => {
  watch(configuration.folders.src.html + '**/*' + configuration.extension.html, this.html);
  watch(configuration.folders.src.css + '**/*' + configuration.extension.sass, css);
  watch(configuration.folders.src.js + '**/*' + configuration.extension.js, js);
}

const copyConfigFiles = () => {
  return src(configuration.configFiles).pipe(dest(configuration.folders.dest));
}

exports.html = series(html.prettify, html.extend, html.htmlClean);

exports.default = series(html.destClean, parallel(css, js, this.html), unCss, copyFolder);
exports.watch = series(this.default, parallel(connectServer, watchAssets, openServer));
exports.build = series(html.destClean, parallel(css, js), this.html, unCss, copyFolder, copyConfigFiles);
