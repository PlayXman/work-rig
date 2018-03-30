const gulp = require('gulp');
const rename = require('gulp-rename');
const watch = require('gulp-watch');
const sourcemaps = require('gulp-sourcemaps');
const less = require('gulp-less');
const LessAutoprefix = require('less-plugin-autoprefix');
const cleanCss = require('gulp-clean-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const imageminJpegRecompress = require('imagemin-jpeg-recompress');
const imageminPngquant = require('imagemin-pngquant');
const mustache = require('gulp-mustache');

/* ################################################## Settings ###################################################### */

const autoprefix = new LessAutoprefix({browsers: ['last 2 versions', 'ie >= 11']});

const paths = {
	css: {
		source: 'src/css/*.less',
		watch: ['src/components/**/*.less', 'src/css/*.less'],
		target: 'build/css'
	},
	js: {
		source: ['src/components/**/*.js'],
		target: 'build/js'
	},
	images: {
		source: 'src/images/**/*',
		target: 'build/images'
	},
	html: {
		source: 'src/templates/*.mustache',
		watch: ['src/components/**/*.mustache', 'src/templates/*.mustache'],
		target: 'build/templates'
	}
};

/* ################################################## Globals ####################################################### */


const color = {
	err: '\x1b[31m%s\x1b[0m',
	warn: '\x1b[33m%s\x1b[0m',
	info: '\x1b[34m%s\x1b[0m'
};

const errorHandlers = {
	css: function(err) {
		console.log('css: ');
		err.extract.forEach(function (val) {
			console.log(color.err, val);
		});
		this.emit('end');
	},
	js: function(err) {
		console.log('js: ');
		console.log(color.err, err);
		this.emit('end');
	},
	skip: function(err) {
		this.emit('end');
	}
};

/* ################################################## Tasks ######################################################### */

gulp.task('css:dev', function () {
	return gulp.src(paths.css.source)
		.pipe(sourcemaps.init())
		.pipe(less().on('error', errorHandlers.css))
		.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.css.target));
});

gulp.task('css:build', function () {
	return gulp.src(paths.css.source)
        .pipe(sourcemaps.init())
		.pipe(less({plugins: [autoprefix]}).on('error', errorHandlers.css))
		.pipe(cleanCss())
		.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.css.target));
});

gulp.task('js:dev', function () {
	return gulp.src(paths.js.source)
		.pipe(sourcemaps.init())
		.pipe(concat('script.min.js'))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.js.target));
});

gulp.task('js:build', function () {
	return gulp.src(paths.js.source)
        .pipe(concat('script.min.js'))
		.pipe(uglify().on('error', errorHandlers.js))
		.pipe(gulp.dest(paths.js.target));
});

gulp.task('image:min', function() {
    return gulp.src(paths.images.source)
        .pipe(imagemin([
            imageminJpegRecompress({ //jpg
                loops: 4,
                min: 60,
                max: 90,
                quality:'high'
            }),
            imageminPngquant({ //png
                speed: 3,
                quality: 90 //lossy settings
            }),
            imagemin.svgo({ //svg
                plugins: [{
                    removeViewBox: false
				}, {
                    cleanupIDs: false
				}, {
                    convertStyleToAttrs: false
                }]
            })
        ],{
            verbose: true
        }))
        .pipe(gulp.dest(paths.images.target));
});

gulp.task('html', function () {
	return gulp.src(paths.html.source)
		.pipe(mustache({}, {
			extension: '.html'
		}))
		.pipe(gulp.dest(paths.html.target));
});

gulp.task('build', ['html', 'css:build', 'js:build', 'image:min']);

gulp.task('watch', ['html', 'css:dev', 'js:dev'], function () {
	watch(paths.html.watch, function () {
		gulp.start(['html']);
	});
	watch(paths.css.watch, function () {
		gulp.start(['css:dev']);
	});
	watch(paths.js.source, function () {
		gulp.start(['js:dev']);
	});
});
