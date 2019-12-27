'use strict';

const address = {
  build: {
    root: 'docs/',
    css: 'docs/css/',
    img: 'docs/img/',
    js: 'docs/js/'
  },
  source: {
    root: 'src/',
    blocks: 'src/blocks/',
    fonts: 'src/fonts/',
    img: 'src/img/',
    sprite: 'src/img/sprite/'
  }
};

const gulp = require('gulp'),
  autoprefixer = require('gulp-autoprefixer'),
  run = require('run-sequence'),
  rename = require('gulp-rename'),
  clean = require('rimraf'),
  jsMin = require('gulp-jsmin'),
  cssMin = require('gulp-clean-css'),
  htmlMin = require('gulp-htmlmin'),
  pug = require('gulp-pug'),
  imageMin = require('gulp-imagemin'),
  svgMin = require('imagemin-svgo'),
  jpegMin = require('imagemin-jpeg-recompress'),
  pngMin = require('imagemin-pngquant'),
  cwebp = require('gulp-cwebp'),
  svgstore = require('gulp-svgstore'),
  stylint = require('gulp-stylint'),
  esLint = require('gulp-eslint'),
  server = require('browser-sync').create(),
  devip = require('dev-ip'),
  posthtml = require('gulp-posthtml'),
  include = require('posthtml-include'),
  readFile = require('utils-fs-read-file'),
  data = require('gulp-data'),
  htmlValidator = require('gulp-w3c-html-validator'),
  babel = require('gulp-babel'),
  stylus = require('gulp-stylus');

devip();

gulp.task('style', function () {
  return gulp.src(`${address.source.blocks}style.styl`)
    .pipe(posthtml([include()])) // сборка из разных файлов
    .pipe(stylus())
    .pipe(autoprefixer())
    .pipe(gulp.dest(address.build.css))
    .pipe(cssMin())
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest(address.build.css));
});

gulp.task('validateHtml', function () {
  return gulp
  .src(`${address.build.root}*.html`)
  .pipe(htmlValidator())
  .pipe(htmlValidator.reporter());
});

gulp.task('stylLint', function () {
  return gulp.src(`${address.source.blocks}**/*.styl`)
    .pipe(stylint())
    .pipe(stylint.reporter());
});

gulp.task('esLint', function () {
  gulp.src([`${address.source.blocks}**/*.js`])
  .pipe(esLint())
  .pipe(esLint.format())
  .pipe(esLint.failAfterError());
});

gulp.task('clean', function (cb) {
  clean('docs', cb);
});

gulp.task('copy', function () {
  gulp.src([`${address.source.fonts}**/*.{woff,woff2}`], {base: `${address.source.root}`})
  .pipe(gulp.dest('docs/'));
});

gulp.task('svgSprite', function () {
  gulp.src(`${address.source.sprite}*.svg`)
  .pipe(imageMin([
    svgMin({
      plugins: [
      {removeDimensions: true},
      {removeAttrs: false},
      {removeElementsByAttr: false},
      {removeStyleElement: false},
      {removeViewBox: false}
      ]
    })
    ]))
  .pipe(svgstore({inlineSvg: true}))
  .pipe(rename({basename: 'sprite', suffix: '.min'}))
  .pipe(gulp.dest(`${address.build.img}`));
});

gulp.task('js', function () {
  gulp.src(`${address.source.blocks}*.js`)
  .pipe(posthtml([include()])) // сборка из разных файлов
  .pipe(babel({
    plugins: [
    "array-includes",
    "@babel/plugin-transform-template-literals"
    ]
  }))
  .pipe(gulp.dest(`${address.build.js}`))
  .pipe(jsMin())
  .pipe(rename({suffix: '.min'}))
  .pipe(gulp.dest(`${address.build.js}`));
});

gulp.task('image', function () {
  gulp.src(`${address.source.img}**/*.{png,jpg,jpeg,svg}`)
  .pipe(imageMin([
    pngMin({quality: '80'}),
    jpegMin({progressive: true, method: 'ms-ssim'}),
    svgMin({
      plugins: [
      {removeDimensions: true},
      {removeAttrs: false},
      {removeElementsByAttr: false},
      {removeStyleElement: false},
      {removeViewBox: false}
      ]
    }),
    ]))
  .pipe(gulp.dest(`${address.build.img}`));
});

gulp.task('cwebp', function () {
  gulp.src(`${address.source.img}**/*.{png,jpg,jpeg}`)
  .pipe(cwebp())
  .pipe(gulp.dest(`${address.build.img}`));
});

gulp.task('html', function () {
  gulp.src(`${address.source.blocks}*.html`)
  .pipe(posthtml([include()])) // сборка из разных файлов
  .pipe(htmlMin({ collapseWhitespace: true }))
  .pipe(gulp.dest(`${address.build.root}`));
});

gulp.task('pug', function (){
  const DATA_PATH = 'src/js/data.json';
  return gulp.src(`${address.source.blocks}**/*.pug`)
    .pipe(data(function () {
      return JSON.parse(readFile.sync(DATA_PATH));
    }))
    .pipe(pug({pretty: true})) // не минифицировать HTML
    .pipe(gulp.dest(function (file) {
      return file.base;
    }));
});

gulp.task('watch', function() {
  gulp.watch(`${address.source.blocks}**/*.html`, ['html', 'reload']);
  gulp.watch(`${address.source.blocks}**/*.styl`, ['style', 'reload']);
  gulp.watch(`${address.source.blocks}**/*.js`, ['js' , 'reload']);
  gulp.watch(`${address.source.img}*.{png,jpg,jpeg,svg}`, ['image', 'cwebp', 'reload']);
  gulp.watch(`${address.source.sprite}*.svg`, ['svgSprite', 'html', 'reload']);
  gulp.watch(`${address.source.blocks}**/*.pug`, ['pug', 'html', 'reload']);
});

gulp.task('reload', function() {
  const TIMEOUT = 500;
  setTimeout(function(){server.reload();}, TIMEOUT);
});

gulp.task ('server', function(done) {
  server.init({
    server: `${address.build.root}`,
    notify: false,
    open: true,
    cors: true,
    host: '192.168.0.91', // дефолтный ip ('192.168.1.76', '192.168.1.80') занят virtualbox, задача devip определила запасной ip
    ui: false
  });
  done();
});

gulp.task ('build', function(done) {
  run (
    'clean',
    'svgSprite',
    'stylLint',
    //'esLint', https://www.bountysource.com/issues/84540079-typeerror-cliengine-is-not-a-constructor
    'copy',
    'image',
    'cwebp',
    'style',
    'js',
    'pug',
    'html',
    'validateHtml',
    done
  );
});

gulp.task ('start', function(done) {
  run (
    'server',
    'watch',
    done
    );
});
