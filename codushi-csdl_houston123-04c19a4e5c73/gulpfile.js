// Dependencies
var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var notify = require('gulp-notify');
var browserSync = require('browser-sync');
var webpack = require('webpack-stream');
var reload = browserSync.reload;

gulp.task('default', ['watch'], function () {
	console.log('Run server with dev..')	
});

gulp.task('watch', ['browserSync'], function () {
	gulp.watch(['views/*.ejs'], reload);
	gulp.watch(['public/**/**', '!public/img/**'], reload);
	gulp.watch(['houston123server.config.js'], reload);
});

gulp.task('server', function () {
	nodemon({
        script: 'server.js',
        watch: ["server.js"]
    }).on('restart', () => {
		gulp.src('server.js')
		.pipe(notify('Running the start tasks and stuff'));
		reload();
 	 });
});

gulp.task('browserSync', ['server', 'webpack'], function () {
	browserSync.init(null, {
		proxy: "https://localhost",
		notify: true,
	});
});

gulp.task('webpack', function () {
	gulp.src('./app/app.js')
	.pipe(webpack( require('./webpack.config.js') ))
	.pipe(gulp.dest('./'));
});