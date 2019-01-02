var gulp = require('gulp');

var sass = require('gulp-sass');
var clean = require('gulp-clean-css');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var webserver = require('gulp-webserver');
var fs = require('fs');
var url = require('url');
var path = require('path');
var data = require('./data/data.json');
//编译sass
gulp.task('sass', function() {
    return gulp.src('./src/scss/*.scss')
        .pipe(sass())
        .pipe(concat('all.css'))
        .pipe(clean())
        .pipe(gulp.dest('./src/css'));
});

//合并压缩js
gulp.task('concatJS', function() {
    return gulp.src('./src/js/*.js')
        .pipe(concat('all.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./src/js'));
});


//监听
gulp.task('watch', function() {
    gulp.watch('./src/scss/*.scss', gulp.series('sass'));
    gulp.watch('./src/js/*.js', gulp.series('concatJS'));
});

//起服务
gulp.task('webserver', function() {
    return gulp.src('./src')
        .pipe(webserver({
            port: 8989,
            open: true,
            livereload: true,
            middleware: function(req, res, next) { //拦截前端请求
                var pathname = url.parse(req.url).pathname;
                //第一次进入页面的时候
                if (pathname === '/favicon.ico') {
                    res.end('');
                    return;
                }

                pathname = pathname === '/' ? 'index.html' : pathname;
                if (pathname === '/api/list') {
                    // res.end();
                    res.send({ code: 0, data: data });

                } else {
                    res.end(fs.readFileSync(path.join(__dirname, 'src', pathname)));
                }

            }
        }));
});




//gulp  开发环境的时候
gulp.task('default', gulp.series('sass', 'concatJS', 'webserver', 'watch'));


//线上环境
//css
gulp.task('copyCss', function() {
    return gulp.src('./src/css/all.css')
        .pipe(gulp.dest('./dist/css'))
});

//js
gulp.task('copyJs', function() {
    return gulp.src('./src/js/all.js')
        .pipe(gulp.dest('./dist/js'))
});

//线上环境
gulp.task('build', gulp.series('copyCss', 'copyJs'));