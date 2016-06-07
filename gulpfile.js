'use strict';

var argv = require('yargs')
                .usage('Usage: $0 -o [file] -g [globals] task')
                .demand(['o'])
                .describe('o', 'Output file')
                .argv;
                
var gulp = require('gulp');
var del = require('del');
var util = require('gulp-util');
var rollup = require('rollup-stream'); 
var uglify = require('gulp-uglify');
var browserSync = require('browser-sync').create();
var babel = require('rollup-plugin-babel');
var includes = require('rollup-plugin-includepaths');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var rename = require('gulp-rename');


var outputFilename = argv.o;
var globals = [];
if (argv.g) {
    globals = Array.isArray(argv.g) ? argv.g : [ argv.g ]
}
var globalMap = {};
globals.forEach((d) => {
    var target = 'd3';
    if (d.indexOf('@redsift/d3-rs') !== -1) {
        var trim = d;
        var paths = trim.split('/');
        if (paths.length > 1) {
            trim = paths.slice(1, paths.length).join('/');
        }
        target = trim.replace(/-/g, '_');
    }

    globalMap[d] = target;
});

var task = {};

gulp.task('clean', () => del([ 'distribution/**' ]));  

gulp.task('umd', task.umd = () => {  
  return rollup({
            moduleName: outputFilename.replace(/-/g, '_'),
            globals: globalMap,
            entry: './index.js',
            format: 'umd',
            sourceMap: true,
            plugins: [ includes({ paths: [ 'src/' ] }), babel() ]
        })
        .pipe(source('main.js', './src'))
        .pipe(buffer())
        .pipe(sourcemaps.init({ loadMaps: true }))
        .pipe(rename({basename: outputFilename}))
        .pipe(rename({suffix: '.umd-es2015'}))
        .pipe(gulp.dest('distribution/'))
        .pipe(uglify())
        .pipe(rename({suffix: '.min'}))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('distribution/'));
});

gulp.task('browser-sync', function() {
    browserSync.init({
        server: {
            baseDir: [ './examples', './distribution' ],
            directory: true
        }
    });
});

gulp.task('serve', ['default', 'browser-sync'], function() {
    gulp.watch(['./*.js', './src/*.js'], [ 'umd' ]);
    gulp.watch('./distribution/*.js').on('change', () => browserSync.reload('*.js'));
    gulp.watch('./examples/**/*.html').on('change', () => browserSync.reload('*.html'));
});

gulp.task('build', [ 'clean' ], task.umd);

gulp.task('default', [ 'umd' ]);