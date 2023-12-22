const gulp = require('gulp');
const plugins = require('gulp-load-plugins')({
    // eslint-disable-next-line max-len
    pattern: ['gulp-*', 'gulp.*', 'browserify', 'watchify', 'del', 'ip', 'opn', 'semver', 'tsify', 'yargs', 'beeper', 'portfinder'],
    replaceString: /\bgulp[\-.]/,
});
const browserSync = require('browser-sync').create();
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const fancyLog = require('fancy-log');

const { argv } = plugins.yargs;
const config = require('./gulp-config.json');
const pkg = require('./package.json');

const { paths } = config;


function stylesDefault() {
    return gulp.src(paths.sass.main)
        .pipe(plugins.if(!argv.release, plugins.sourcemaps.init()))
        .pipe(plugins.sass({ outputStyle: 'compressed' }).on('error', plugins.sass.logError))
        .pipe(plugins.autoprefixer({ remove: false }))
        .pipe(plugins.if(!argv.release, plugins.sourcemaps.write()))
        .pipe(plugins.rename('styles.css'))
        .pipe(plugins.size())
        .pipe(gulp.dest(paths.sass.dest))
        .pipe(browserSync.stream())
        .pipe(plugins.notify('Main styles ready!'));
}


// // Copy fonts

function fonts() {
    return gulp
        .src(paths.fonts.source)
        .pipe(plugins.newer(paths.fonts.dest))
        .pipe(gulp.dest(paths.fonts.dest))
        .pipe(plugins.notify({ message: 'Fonts copied!', onLast: true }));
}


// // Copy map data

function mapdata() {
    return gulp
        .src(paths.mapdata.source)
        .pipe(plugins.newer(paths.mapdata.dest))
        .pipe(gulp.dest(paths.mapdata.dest))
        .pipe(plugins.notify({ message: 'Map data copied!', onLast: true }));
}

// // Favicons

function favicons() {
    return gulp
        .src(paths.favicons.source)
        .pipe(gulp.dest(paths.favicons.dest))
        .pipe(plugins.notify({ message: 'Favicons copied!', onLast: true }));
}

// // Libs

function libs() {
    const libFiles = paths.scripts.libs.concat(paths.scripts.plugins);
    return gulp.src(libFiles, { allowEmpty: true })
        .pipe(plugins.expectFile(libFiles))
        .pipe(plugins.concat('libs.min.js'))
        .pipe(plugins.uglify())
        .pipe(gulp.dest(paths.scripts.dest))
        .pipe(plugins.notify('Libs ready!'));
}

// function connectServer() {
//     return browserSync.init({
//         open: true,
//         ghostMode: false,
//         server: true,
//     });
// }

// Scripts
const bundler = plugins.browserify({
    basedir: '.',
    debug: !argv.release,
    entries: [paths.scripts.mainTs],
    cache: {},
    packageCache: {},
    plugin: [plugins.tsify],
});

function bundle() {
    return (
        bundler
            .bundle()
            .on('error', function(err) {
                fancyLog.error(err);
                this.emit('end');
            })
            .pipe(source('scripts.min.js'))
            .pipe(buffer())
            .pipe(plugins.if(!!argv.release, plugins.stripDebug()))
            .pipe(plugins.sourcemaps.init({ loadMaps: true }))
            .pipe(plugins.if(argv.release, plugins.uglify()))
            .pipe(plugins.sourcemaps.write('./'))
            .pipe(gulp.dest(paths.scripts.dest))
            .pipe(plugins.notify('Bundle scripts ready!'))
    );
}

function watchBundle() {
    const watchBundler = plugins.browserify({
        basedir: '.',
        debug: true,
        entries: [paths.scripts.mainTs],
        cache: {},
        packageCache: {},
        plugin: [plugins.tsify],
    });

    const rebundle = () => {
        fancyLog('start rebundle');
        return (
            watchBundler
                .bundle()
                .on('error', fancyLog.error)
                .pipe(source('scripts.min.js'))
                .pipe(gulp.dest(paths.scripts.dest))
                .pipe(browserSync.stream())
                .pipe(plugins.notify('Bundle scripts ready!'))
        );
    };

    watchBundler.plugin(plugins.watchify, {
        delay: 100,
        ignoreWatch: ['**/node_modules/**'],
        poll: false,
    });

    watchBundler.on('update', rebundle);
    watchBundler.on('log', fancyLog);

    return rebundle();
}

// Clean

function cleanImages() {
    return plugins.del([paths.images.dest, paths.svg.dest, paths.svg.app], { force: true });
}

function clean() {
    return plugins.del([
        paths.sass.dest,
        paths.scripts.dest,
        paths.images.dest,
        paths.fonts.dest,
    ], { force: true });
}

// // Images
function imagemin() {
    return gulp
        .src(paths.images.source)
        .pipe(plugins.newer(paths.images.dest))
        .pipe(plugins.imagemin())
        .pipe(gulp.dest(paths.images.dest))
        .pipe(plugins.notify({ message: 'Images minified successfuly!', onLast: true }));
}


// compress svg files:
function svgmin() {
    return gulp.src(paths.svg.inline)
        .pipe(plugins.newer(paths.svg.dest))
        .pipe(plugins.svgmin())
        .pipe(gulp.dest(paths.svg.dest))
        .pipe(gulp.dest(paths.svg.app))
        .pipe(browserSync.stream())
        .pipe(plugins.notify({ message: 'SVG minified successfuly!', onLast: true }));
}


// copy svgs without minification
// to destination folder:
function svgnomin() {
    return gulp.src(paths.svg.nomin)
        .pipe(plugins.newer(paths.svg.dest))
        .pipe(gulp.dest(paths.svg.dest))
        .pipe(gulp.dest(paths.svg.app))
        .pipe(plugins.notify({ message: 'SVG no-min copied successfuly!', onLast: true }));
}


// prepare svg sprite file
// and save it in destination folder:
function svgstore() {
    return gulp
        .src(paths.svg.sprite)
        .pipe(plugins.svgmin({
            plugins: [
                { removeAttrs: { attrs: '(fill|stroke)' } },
                { addAttributesToSVGElement: { attribute: 'preserveAspectRatio="xMidYMid meet"' } },
            ],
        }))
        .pipe(plugins.rename({ prefix: 'sprite-' }))
        .pipe(plugins.svgstore({ fileName: 'sprite.svg', inlineSvg: true }))
        .pipe(gulp.dest(paths.svg.app))
        .pipe(plugins.notify({ message: 'SVG sprite created!', onLast: true }));
}

// // Video

function videos() {
    return gulp
        .src(paths.videos.source)
        .pipe(plugins.newer(paths.videos.dest))
        .pipe(gulp.dest(paths.videos.dest))
        .pipe(plugins.notify({ message: 'Videos ready!', onLast: true }));
}


// Test

function test() {
    const url = pkg.homepage;
    plugins.opn(`https://developers.google.com/speed/pagespeed/insights/?url=${url}`);
    plugins.opn(`https://validator.w3.org/nu/?doc=http%3A%2F%2F${url}`);
    plugins.opn(`http://realfavicongenerator.net/favicon_checker?ignore_root_issues=on&site=${url}`);
    plugins.opn(`https://developers.facebook.com/tools/debug/og/object?q=http%3A%2F%2F${url}`);
    plugins.opn('https://cards-dev.twitter.com/validator');
    plugins.opn('https://www.w3.org/2003/12/semantic-extractor.html');
    plugins.opn('https://gtmetrix.com/');
    plugins.opn('http://www.webpagetest.org/compare');
    plugins.opn('http://www.webpagetest.org/mobile');
    plugins.opn('http://loads.in/');
    plugins.opn('https://varvy.com/');
    plugins.opn('https://sonarwhal.com/scanner');
    plugins.opn(`https://gsnedders.html5.org/outliner/process.py?url=http%3A%2F%2F${url}`);
    plugins.opn(`http://wave.webaim.org/report#/${url}`);
    plugins.opn(`https://securityheaders.io/?q=${url}&followRedirects=on`);
    plugins.opn('https://pageweight.imgix.com/');
    plugins.opn('http://www.checkmycolours.com/');
    plugins.opn('http://achecker.ca/checker/');
}

// Bump Version

function bump() {
    const newVer = argv.release ? plugins.semver.inc(pkg.version, 'patch') : pkg.version;

    gulp.src(['./application/views/view_app.html'], { allowEmpty: true })
        .pipe(plugins.replace(/\?v=([^\"]+)/g, `?v=${newVer}`))
        .pipe(gulp.dest('./application/views/'));

    gulp.src(['./workspace/views/base.twig'])
        .pipe(plugins.replace(/\?v=([^\"]+)/g, `?v=${newVer}`))
        .pipe(gulp.dest('./workspace/views/'));

    gulp.src(['./src/scss/main.scss'])
        .pipe(plugins.replace(/Version: (\d+\.\d+\.\d+)/g, `Version: ${newVer}`))
        .pipe(gulp.dest('./src/scss/'));

    return gulp.src(['./package.json'])
        .pipe(plugins.if(argv.release, plugins.bump({ version: newVer })))
        .pipe(gulp.dest('./'));
}

// Init clean

function init() {
    gulp.src(['./package.json'])
        .pipe(
            plugins.bump({ version: '0.0.0' }),
        )
        .pipe(gulp.dest('./'));

    // eslint-disable-next-line max-len
    return plugins.del(['../src/fonts/**/*', '../src/images/favicons/*', '../src/scss/includes/components/*.scss', '../src/scss/includes/scaffold/*.scss', '../src/ts/Site.ts', '../src/ts/components/*.ts'], { force: true });
}

// Watch

function watch() {
    plugins.portfinder.basePort = 7000;
    plugins.portfinder.getPort({ port: 7000, stopPort: 7999 }, () => {
        browserSync.init({
            open: true,
            host: plugins.ip.address(),
            startPath: '/workspace',
            ghostMode: false,
            proxy: config.proxyURL,
            port: 7000,
            notify: false,
            files: ['workspace/**/*', 'application/**/*'],
        });
    });
    gulp.watch(paths.styles.main, stylesDefault);
    gulp.watch(paths.images.source);
    watchBundle();
}


exports.styles = gulp.series(stylesDefault);
exports.scripts = bundle;
exports.test = test;
exports.init = init;
exports.videos = videos;
exports.libs = libs;
exports.fonts = fonts;
exports.bump = bump;
exports.favicons = favicons;
exports.images = gulp.series(cleanImages, imagemin, svgnomin, svgmin, svgstore);
// eslint-disable-next-line max-len
exports.default = gulp.series(clean, exports.styles, exports.libs, exports.scripts, exports.images, fonts, mapdata, favicons, bump);
exports.watch = watch;
