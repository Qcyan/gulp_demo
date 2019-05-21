'use strict';

var gulp = require('gulp'),
	sass = require('gulp-sass'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rename = require('gulp-rename'),
	filter = require('gulp-filter'),
	cssmin = require('gulp-clean-css'),
	autoprefixer = require('gulp-autoprefixer');

var programName = `dajiankang`;

var configArr = {
  [programName]: {
    sass: [
      `./${programName}/Static/**/*.scss`,
      `!./${programName}/Static/public/css/**/*.scss`
    ],
    js: [
      `./${programName}/Static/**/*.js`,
      `./${programName}/Public/**/*.js`,
      `!./${programName}/**/*.min.js`,
      `!.${programName}/**/node_modules`
    ],
    dist: `.`,
    watch: {
      sass: [
        `./${programName}/Static/**/*.scss`,
        `!./${programName}/Static/public/css/**/*.scss`
      ],
      js: [
        `./${programName}/Static/**/*.js`,
        `./${programName}/Public/**/*.js`,
        `!./${programName}/**/*.min.js`,
        `!./${programName}/**/node_modules`
      ]
    }
  },
  // "fuwutong": {
  //   sass: [
  //     "./fuwutong/Static/**/*.scss",
  //     "!./fuwutong/Static/public/css/**/*.scss"
  //   ],
  //   js: [
  //     "./fuwutong/Static/**/*.js",
  //     "./fuwutong/Public/**/*.js",
  //     "!./fuwutong/**/*.min.js",
  //     "!.fuwutong/**/node_modules"
  //   ],
  //   dist: ".",
  //   watch: {
  //     sass: [
  //       "./fuwutong/Static/**/*.scss",
  //       "!./fuwutong/Static/public/css/**/*.scss"
  //     ],
  //     js: [
  //       "./fuwutong/Static/**/*.js",
  //       "./fuwutong/Public/**/*.js",
  //       "!./fuwutong/**/*.min.js",
  //       "!./fuwutong/**/node_modules"
  //     ]
  //   }
  // },
}

var taskQueue = [];
var watchQueue = [];

var newTask = function(name) {

	gulp.task('sass_' + name, function() {

		return gulp.src(configArr[name].sass, {
				base: '.'
			}).pipe(sass({
				outputStyle: 'compressed'
			}).on('error', sass.logError))
			.pipe(autoprefixer({
				browsers: ['last 8 versions', 'ie 6-8']
			}))
			.pipe(gulp.dest(configArr[name].dist));

	});

	gulp.task('js_' + name, function() {
		
		//过滤
		const f = filter((file)=>{
			if(/\.min\.js/g.test(file.path)){
				return false;
			}
			return true;
		});
		
		return gulp.src(configArr[name].js, {
				base: '.'
			})
			.pipe(f)
			.pipe(uglify().on('error',(err)=>{
				console.log(err);
			}))
			.pipe(rename(function(path) {
				if(!/\.min/g.test(path.basename)) {
					path.basename += ".min";
				}
			}))
			.pipe(gulp.dest(configArr[name].dist));
	});

}

//watch fn
var watch = function(name) {

	console.log(configArr[name].watch.sass,configArr[name].watch.js);

	gulp.task("watch_" + name, function() {

		var sass = gulp.watch(configArr[name].watch.sass, ['sass_' + name]);

		var js = gulp.watch(configArr[name].watch.js, ['js_' + name]);

		sass.on('change', (event) => {
			console.log(new Date().toLocaleTimeString() + '修改:' + event.path + ',操作类型：' + event.type);
		});

		js.on('change', (event) => {
			console.log(new Date().toLocaleTimeString() + ',修改:' + event.path + ',操作类型：' + event.type);
		});
	});

	return "watch_" + name;

}

// 预编译任务

for(var name in configArr) {

	newTask(name);
	// 推入预编译任务列表
	taskQueue = taskQueue.concat(['js_' + name, 'sass_' + name]);

	// 监控任务
	taskQueue.unshift(watch(name));
}

gulp.task('default', taskQueue);


