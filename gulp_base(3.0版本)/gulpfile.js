

//表示引进gulp模块  // 引入依赖包
var gulp = require('gulp'),
  sass = require('gulp-sass'),
  uglify = require('gulp-uglify'), //压缩js
  rename = require('gulp-rename'), //文件更名
  filter = require('gulp-filter'),
  cssmin = require('gulp-clean-css'); //压缩css


//自己定义的任务名
// gulp.task('sass', function(){
//   return gulp.src('./app/static/**/*.scss')
//     .pipe(sass().on('error', sass.logError)) // Converts Sass to CSS with gulp-sass
//     .pipe(gulp.dest('./'))
// });
//
// gulp.task('sass:watch', function(){
//   gulp.watch('./app/static/**/*.scss', ['sass']).on('change',reload);
// })



var configArr = {
  "app": {
    sass: [
      "./app/static/**/*.scss"
    ],
    js: [
      "./app/js/**/*.js"
    ],
    dist: ".",
    watch: {
      sass: [
        "./app/static/**/*.scss"
      ],
      js: [
        "./app/js/**/*.js",
        "!/app/js/**/*.min.js"
      ]
    }
  }
}

var taskQueue = [];
var watchQueue = [];

var newTask = function(name){
  gulp.task('sass_' + name, function(){
    return gulp.src(configArr[name].sass, {
      base: '.'
    }).pipe(sass({
      outputStyle: 'compressed'
    }).on('error', sass.logError))
      .pipe(gulp.dest(configArr[name].dist));
  })

  //js任务
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


var watch = function(name){
  // console.log(configArr[name].watch.sass,configArr[name].watch.js);

  gulp.task('watch_' + name, function(){

    var sass = gulp.watch(configArr[name].watch.sass,['sass_'+name])

    var js = gulp.watch(configArr[name].watch.js, ['js_' + name]);

    sass.on('change',(event) => {
      console.log(new Date().toLocaleTimeString() + '修改:' + event.path + ',操作类型：' + event.type);
    });

    js.on('change', (event) => {
      console.log(new Date().toLocaleTimeString() + ',修改:' + event.path + ',操作类型：' + event.type);
    });

    // Other watchers
  })
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
