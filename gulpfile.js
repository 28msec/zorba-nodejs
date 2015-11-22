'use strict';

var fs = require('fs');

var yaml = require('js-yaml');
var request = require('request');
var map = require('map-stream');

var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var stylish = require('jshint-stylish');

var CodeGen = require('swagger-js-codegen').CodeGen;

gulp.task('lint:js', function(){
    return gulp.src(['gulpfile.js'])
        .pipe($.jshint())
        .pipe($.jshint.reporter())
        .pipe($.jshint.reporter(stylish))
        .pipe($.jshint.reporter('fail'));
});

gulp.task('lint:json', function(){
    return gulp.src(['package.json'])
        .pipe($.jsonlint())
        .pipe($.jsonlint.reporter())
        .pipe(map(function(file, cb) {
            if (!file.jsonlint.success) {
                process.exit(1);
            }
            cb(null, file);
        }));
});

gulp.task('swagger:resolve', function(done){
    request({ url: 'https://raw.githubusercontent.com/28msec/zorba/wcandillon-patch-4/doc/swagger/evaluate.yml' }, function(err, resp){
        fs.writeFileSync('zorba-server-api.json', JSON.stringify(yaml.load(resp.body), null, 2));
        done();
    });
});


gulp.task('swagger:js', ['swagger:resolve'], function(){
    var apis = [
        {
            swagger: 'zorba-server-api.json',
            moduleName: 'zorba-api',
            className: 'ZorbaAPI'
        }
    ];
    //JavaScript Bindings
    var dest = 'lib';
    apis.forEach(function(api){
        var swagger = JSON.parse(fs.readFileSync(api.swagger, 'utf-8'));
        var source = CodeGen.getAngularCode({ moduleName: api.moduleName, className: api.className, swagger: swagger });
        $.util.log('Generated ' + api.moduleName + '.js from ' + api.swagger);
        fs.writeFileSync(dest + '/' + api.moduleName + '.js', source, 'UTF-8');
    });
});

gulp.task('default', ['swagger:js', 'lint:json', 'lint:js']);