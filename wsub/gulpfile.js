var browserify = require('browserify');
var gulp = require('gulp');
var bower = require('gulp-bower');
var source = require('vinyl-source-stream');
var karma = require('gulp-karma');
var watchify = require('watchify');
var size = require('gulp-size');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var runSequence = require('run-sequence');

const BROWSERIFY_APP_FILE = './src/app.js';
const BUILD_DIR = './build';
const OUTPUT_FILE = 'subs.js';
const SRC_FILES = './src/**/*.js';
const TESTS_FILES = './tests/*.js';
const SIZE_OPTS = {
    showFiles: true,
    gzip: true
};
const COMMON_LIBS = [
    './bower_components/jquery/dist/jquery.js',
    './bower_components/datatables/media/js/jquery.dataTables.js',
    './bower_components/bootstrap/dist/js/bootstrap.js',
    './bower_components/angular/angular.js',
    './bower_components/ngDialog/js/ngDialog.js',
    './bower_components/angular-mocks/angular-mocks.js',
    './bower_components/lodash/lodash.js',
    './bower_components/file-saver/FileSaver.js',
];

gulp.task('download-deps', function() {
    return bower();
});

gulp.task('build-app', function() {
    return browserify(BROWSERIFY_APP_FILE)
        .bundle()
        .pipe(source(OUTPUT_FILE))
        .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('build-common', function() {
    return gulp.src(COMMON_LIBS)
        .pipe(size(SIZE_OPTS))
        .pipe(concat("common.min.js"))
        .pipe(uglify())
        .pipe(size(SIZE_OPTS))
        .pipe(gulp.dest(BUILD_DIR));
});

gulp.task('test', function() {
    return gulp.src('./fakefile')
        .pipe(karma({
            configFile: 'karma.conf.js',
        }));
});

gulp.task('watch', function() {
    gulp.src(SRC_FILES.concat(TESTS_FILES))
        .pipe(karma({
            configFile: 'karma.conf.js',
            action: 'watch'
        }));
    gulp.watch(SRC_FILES, ['build-app']);
});

gulp.task('coverage', function() {
    return gulp.src('./fakefile')
        .pipe(karma({
            configFile: 'karma.conf.js',
            reporters: ['progress', 'coverage'],
            browserify: {
                debug: true,
                transform: ['browserify-istanbul']
            },
            coverageReporter: {
                reporters: [
                    {type: 'html'},
                    {type: 'text-summary'}
                ]
            },
        }));
});

gulp.task('build', function(callback) {
    runSequence(['download-deps', 'build-app'], 'build-common', callback);
});

gulp.task('default', ['watch']);
