var gulp = require('gulp');
var fs = require('fs');
var concat = require('gulp-concat');
var cssbeautify = require('gulp-cssbeautify');
var livereload = require('gulp-livereload');
var minifyCSS = require('gulp-minify-css');
var plumber = require('gulp-plumber');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var postcss = require('gulp-postcss');
var tictail = require('gulp-tictail');
var eslint = require('gulp-eslint');
var uglify = require('gulp-uglify');



var STORE_ID = 'Uf';  // Change this to the ID of your TicTail store!



var src = {
  theme: 'src/*.mustache',
  styles: 'src/styles/style.css',
  scripts: 'src/scripts/main.js',
  buildScripts: [
    'src/scripts/vendor/modernizr-custom.js',
    'src/scripts/vendor/imagesloaded.pkgd.js',
    'src/scripts/vendor/stickyfill.js',
    'src/scripts/main.js'
  ]
};


var dest = {
  theme: 'build/',
  styles: 'build/styles/',
  scripts: 'build/scripts/'
};


var errorHandler = function(error) {
  console.log(error);
  return 'end';
};


gulp.task('styles', /*['bem-lint'],*/ function () {
  return gulp.src(src.styles)
    .pipe(plumber(errorHandler))
    .pipe(postcss([
      require('postcss-import')(),
      require('postcss-css-variables')(),
      require('postcss-custom-media')(),
      require('postcss-color-function')(),
      require('postcss-custom-selectors')(),
      require('postcss-extend')(),
      require('autoprefixer')({
        browsers: ['last 2 versions', 'ie 8'],
        cascade: false
      }),
      require('postcss-reporter')
    ]))
    // .pipe(minifyCSS({
    //   keepSpecialComments: true
    // }))
    .pipe(cssbeautify({
      indent: '  '
    }))
    .pipe(rename('style-min.css'))
    .pipe(gulp.dest(dest.styles));
});


gulp.task('bem-lint', function () {
  return gulp.src('src/styles/**/*.css')
    .pipe(plumber(errorHandler))
    .pipe(postcss([
      require('postcss-bem-linter')({
        preset: 'suit',
        ignoreSelectors: /\.has-.+/
      }),
      require('postcss-reporter')
    ]));
});


gulp.task('js-lint', function () {
  return gulp.src(src.scripts)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});


gulp.task('scripts', ['js-lint'], function () {
  return gulp.src(src.buildScripts)
    .pipe(plumber(errorHandler))
    .pipe(concat('main-min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(dest.scripts));
});


gulp.task('build', ['scripts', 'styles'], function () {
  gulp.src('src/theme.mustache')
    .pipe(plumber(errorHandler))
    .pipe(replace('<link href="/build/styles/style-min.css" rel="stylesheet">', function (foo, bar, asd) {
      var style = fs.readFileSync(dest.styles + 'style-min.css', 'utf8');
      return '<style>\n' + style + '\n</style>';
    }))
    .pipe(replace('<script src="/build/scripts/main-min.js" async></script>', function () {
      var js = fs.readFileSync(dest.scripts + 'main-min.js', 'utf8');
      return '<script>\n' + js + '\n</script>';
    }))
    .pipe(replace('{{!children?}}', '{{#children?}}'))
    .pipe(replace('{{!!children?}}', '{{/children?}}'))
    .pipe(replace(/<!-- test -->[\s\S]*?<!-- \/test -->/g, ''))
    .pipe(gulp.dest(dest.theme));
});


gulp.task('watch', function () {
  gulp.watch('src/**/*.css', ['build']);
  gulp.watch(src.scripts, ['build']);
  gulp.watch(src.theme, ['build']);
});


gulp.task('serve', function () {
  tictail.serve({
    src: './build',
    store_id: STORE_ID
  });
});


gulp.task('default', ['serve', 'build', 'watch']);
