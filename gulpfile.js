var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('bower');
var concat = require('gulp-concat');
var sass = require('gulp-sass');
var minifyCss = require('gulp-minify-css');
var rename = require('gulp-rename');
var sh = require('shelljs');
var paths = {
  sass: ['./scss/**/*.scss']
  // db :['./www/*.db'],
  // json : ['theme.json'],
  // varsass : ['./www/lib/ionic/scss/theme.scss']
};

var jsonSass = require('json-sass');
var source = require('vinyl-source-stream');
var fs = require('fs');
var SqliteToJson = require('sqlite-to-json');
var sqlite3 = require('sqlite3');
var exporter = new SqliteToJson({
  client: new sqlite3.Database('./www/data3.db')
});

gulp.task('default', ['sass']);

// gulp.task('load_theme', function() {
//   return exporter.save('Themes', 'theme.json', function (err) {
//     if (err) {
//       console.log(err.message);
//     }
//     else {
//       console.log("La table themes a été enregistrée dans le fichier theme.json");
//     }
//   });
// });
//
// gulp.task('export_theme',['load_theme'], function() {
//   console.log("Le fichier theme.json a été exporté en scss");
//   return fs.createReadStream('theme.json')
//     .pipe(jsonSass({
//       prefix: '$theme: ',
//     }))
//     .pipe(source('theme.json'))
//     .pipe(rename('theme.scss'))
//     .pipe(gulp.dest('./www/lib/ionic/scss'));
// });


gulp.task('sass', function(done) {
  gulp.src('./scss/ionic.app.scss')
    .pipe(sass())
    .on('error', sass.logError)
    .pipe(gulp.dest('./www/css/'))
    .pipe(minifyCss({
      keepSpecialComments: 0
    }))
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./www/css/'))
    .on('end', done);
});

gulp.task('watch', function() {
  // gulp.watch(paths.db, ['load_theme']);
  // gulp.watch(paths.json, ['export_theme']);
  gulp.watch(paths.sass, ['sass']);
  // gulp.watch(paths.varsass, ['sass']);
});

gulp.task('install', ['git-check'], function() {
  return bower.commands.install()
    .on('log', function(data) {
      gutil.log('bower', gutil.colors.cyan(data.id), data.message);
    });
});

gulp.task('git-check', function(done) {
  if (!sh.which('git')) {
    console.log(
      '  ' + gutil.colors.red('Git is not installed.'),
      '\n  Git, the version control system, is required to download Ionic.',
      '\n  Download git here:', gutil.colors.cyan('http://git-scm.com/downloads') + '.',
      '\n  Once git is installed, run \'' + gutil.colors.cyan('gulp install') + '\' again.'
    );
    process.exit(1);
  }
  done();
});
