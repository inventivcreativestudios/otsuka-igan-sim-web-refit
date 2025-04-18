let gulp = require('gulp')
let concat = require('gulp-concat')
let minifyCSS = require('gulp-clean-css')
let order = require('gulp-order')
let plumber = require('gulp-plumber')
let sass = require('gulp-sass')(require('sass'))
let hogan = require('gulp-hogan')
let browserSync = require('browser-sync').create()
let del = require('del')

function bytesToSize (bytes) {
    let sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Byte'
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)))
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i]
}

function serve(callback) {
    // gulp.series('build')
    initBrowserSync()
    gulp.watch('./src/styles/**/*', gulp.series('css', reload))
    gulp.watch('./src/js/**/*', gulp.series('js', reload))
    gulp.watch('./src/assets/images/**/*', gulp.series('images', reload))
    gulp.watch('./src/assets/fonts/**/*', gulp.series('fonts', reload))
    gulp.watch('./src/assets/videos/**/*', gulp.series('videos', reload))
    gulp.watch('./src/**/*.hogan', gulp.series('html', reload))
    gulp.watch('./src/**/*.html', gulp.series('html', reload))
    callback()
}

async function deleteDist() {
    const deletedDirectoryPaths = await del(['dist'])
    // console.log('Deleted directories:\n', deletedDirectoryPaths.join('\n'))
}

function initBrowserSync() {
    browserSync.init({
        server: {
            baseDir: 'dist/'
        },
        open: false, // Change it to false if you would not like Browsersync to open a browser window
        notify: false
    })
}

function reload(callback) {
    browserSync.reload();
    callback();
}

// PROCESS CSS
gulp.task('css', function () {
    return gulp.src('./src/styles/main.scss')
        .pipe(plumber())
        .pipe(sass().on('error', sass.logError))
        // Note: Does not include auto-prefixer
        // Note: Does not include source maps
        .pipe(minifyCSS({ debug: true, compatibility: 'ie10' }, function (details) {
        if (details.errors.length > 0) {
            console.log(details.errors)
        } else {
            console.log(details.name + ' has 0 errors')
        }
        if (details.warnings.length > 0) {
            console.log(details.warnings)
        } else {
            console.log(details.name + ' has 0 warnings')
        }
        // console.log(details.name + ' original size: ' + bytesToSize(details.stats.originalSize))
        // console.log(details.name + ' optimized size: ' + bytesToSize(details.stats.minifiedSize))
        // console.log(details.name + ' optimized in ' + details.stats.timeSpent + 'ms')
        // console.log(details.name + ' efficiency: ' + ~~((details.stats.efficiency) * 100).toFixed(2) + '%')
        }))
        .pipe(concat('styles.bundle.css'))
        .pipe(gulp.dest('./dist'))
})

// PROCESS JS
gulp.task('js', function () {
    return gulp.src('./src/js/**/*.js')
        .pipe(plumber())
        .pipe(order([
            'libs/gsap.min.js',
            'libs/*.js',
            'utils.js',
            '-main.js',
            'components/*.js'
        ]))
        .pipe(concat('static.bundle.js'))
        .pipe(gulp.dest('./dist'))
})

// PROCESS IMAGES

gulp.task('images', function () {
    return gulp.src('./src/assets/images/**/*')
        .pipe(gulp.dest('./dist/assets/images'))
})

// PROCESS HTML
gulp.task('html', function () {
    return gulp.src(['./src/**/*.hogan', '!src/templates/*'], {}, '.html')
        .pipe(hogan(null, null, '.html'))
        .pipe(gulp.dest('./dist'))
})

// PROCESS FONTS
gulp.task('fonts', function () {
    return gulp.src('./src/assets/fonts/**/*')
        .pipe(gulp.dest('./dist/assets/fonts'))
})

// PROCESS VIDEOS
gulp.task('videos', function () {
    return gulp.src('./src/assets/videos/**/*')
        .pipe(gulp.dest('./dist/assets/videos'))
})

gulp.task('copyShared', function() {
    return gulp.src(['./robots.txt', './sitemap.xml'])
        .pipe(gulp.dest('./dist'))
})

// Copy Pathogenesis 
gulp.task('copyNeedleAssets1', function() {
    return gulp.src('./src/pathogenesis/assets/**/*')
        .pipe(gulp.dest('./dist/pathogenesis/assets'))
})
gulp.task('copyNeedleAssets2', function() {
    return gulp.src('./src/pathogenesis/include/**/*')
        .pipe(gulp.dest('./dist/pathogenesis/include'))
})
gulp.task('copyNeedleAssets3', function() {
    return gulp.src('./src/pathogenesis/needle.buildinfo.json')
        .pipe(gulp.dest('./dist/pathogenesis'))
})

// TASK LISTS
gulp.task('default', gulp.series('css', 'js', 'html', 'images', 'fonts', 'videos', 'copyNeedleAssets1', 'copyNeedleAssets2', 'copyNeedleAssets3', 'copyShared'))
gulp.task('build', gulp.series('css', 'js', 'html', 'images', 'fonts', 'videos', 'copyNeedleAssets1', 'copyNeedleAssets2', 'copyNeedleAssets3', 'copyShared'))
gulp.task('clean', deleteDist)
gulp.task('serve', serve)
// gulp.task('watch', function () {
//     gulp.watch('./src/styles/**/*', gulp.parallel('css')).on('change', browserSync.reload)
//     gulp.watch('./src/js/**/*', gulp.parallel('js')).on('change', browserSync.reload)
//     // gulp.watch('./src/assets/images/**/*', gulp.parallel('images')).on('change', browserSync.reload)
//     gulp.watch('./src/assets/fonts/**/*', gulp.parallel('fonts')).on('change', browserSync.reload)
//     gulp.watch('./src/assets/videos/**/*', gulp.parallel('videos')).on('change', browserSync.reload)
//     gulp.watch('./src/**/*.hogan', gulp.parallel('html')).on('change', browserSync.reload)
// })