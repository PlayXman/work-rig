const gulp = require('gulp');
const rename = require('gulp-rename');
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

const autoprefix = new LessAutoprefix({browsers: ['last 2 versions']});

const paths = {
	css: {
		source: 'src/css/style.less',
		watch: ['src/components/**/*.less', 'src/css/*.less'],
		target: 'build/css'
	},
	js: {
		source: ['src/components/**/*.js'],
		target: 'build/js',
	},
	images: {
		source: 'src/images/**/*',
		target: 'build/images'
	},
	html: {
		source: 'src/templates/*.mustache',
		watch: ['src/components/**/*.mustache', 'src/templates/*.mustache'],
		target: 'build/templates'
	},
	font: {
		source: 'src/fonts/*',
		target: 'build/fonts'
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

function css_dev() {
	return gulp.src(paths.css.source)
		.pipe(sourcemaps.init())
		.pipe(less().on('error', errorHandlers.css))
		.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.css.target));
}

function css_build() {
	return gulp.src(paths.css.source)
		.pipe(sourcemaps.init())
		.pipe(less({plugins: [autoprefix]}).on('error', errorHandlers.css))
		.pipe(cleanCss())
		.pipe(rename({suffix: '.min'}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(paths.css.target));
}

function js_dev() {
	return gulp.src(paths.js.source)
		.pipe(concat('script.min.js'))
		.pipe(gulp.dest(paths.js.target));
}

function js_build() {
	return gulp.src(paths.js.source)
		.pipe(concat('script.min.js'))
		.pipe(uglify().on('error', errorHandlers.js))
		.pipe(gulp.dest(paths.js.target));
}

function image_min() {
	return gulp.src(paths.images.source)
		.pipe(imagemin([
			imageminJpegRecompress({ //jpg
				loops: 4,
				min: 60,
				max: 90,
				quality: 'high'
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
		], {
			verbose: true
		}))
		.pipe(gulp.dest(paths.images.target));

}

function html() {
	return gulp.src(paths.html.source)
		.pipe(mustache({}, {
			extension: '.html'
		}).on('error', errorHandlers.js))
		.pipe(gulp.dest(paths.html.target));

}

function fonts() {
	return gulp.src(paths.font.source)
		.pipe(gulp.dest(paths.font.target));

}

function watch() {
	gulp.watch(paths.html.watch, html);
	gulp.watch(paths.css.watch, css_dev);
	gulp.watch(paths.js.source, js_dev);
}

exports.css_dev = css_dev;
exports.css_build = css_build;
exports.js_dev = js_dev;
exports.js_build = js_build;
exports.image_min = image_min;
exports.html = html;
exports.fonts = fonts;
exports.build = gulp.parallel(html, css_build, js_build, image_min, fonts);
exports.watch = gulp.series(gulp.parallel(html, css_dev, js_dev), watch);
