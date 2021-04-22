import gulp from "gulp";
import del from "del";
import babel from "gulp-babel";
import uglify from "gulp-uglify-es";
import chalk from "chalk";
import stripColour from "strip-ansi";
import postCss from "gulp-postcss";
import postCssPreset from "postcss-preset-env";
import purgeCss from "@fullhuman/postcss-purgecss";
import tailwind from "tailwindcss";
import cssNano from "cssnano";
import browserSync from "browser-sync";

const server = browserSync.create();

// File locations
const siteRoot = "./src";
const distRoot = "./dist";

const assetsRoot = "/assets";
const destStylesFolder = distRoot + assetsRoot + "/css";
const destScriptsFolder = distRoot + assetsRoot + "/js";
const srcFiles = [siteRoot + "/**/*.html", siteRoot + assetsRoot + "/images/**/*.*"];
const srcStyles = siteRoot + assetsRoot + "/src/css/style.css";
const srcScripts = siteRoot + assetsRoot + "/src/js/**/*.js";
const cssOutputFiles = [siteRoot + "/**/*.html", srcScripts];

// Helpers
const logInfo = str => {
    console.log(chalk.black.bgWhite(stripColour(str)));
};

const logError = err => {
    console.error(chalk.white.bgRed(stripColour(err instanceof Error ? err.message : err)));
};

// Tasks
const clean = done =>
    del([distRoot], done);

const copyFiles = () => gulp
    .src(srcFiles, { base: siteRoot })
    .pipe(gulp.dest(distRoot));

const processCss = () => gulp
    .src(srcStyles)
    .pipe(postCss([tailwind,
        postCssPreset]))
    .pipe(gulp.dest(destStylesFolder))
    .pipe(postCss([purgeCss({ content: cssOutputFiles, defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [] }),
        cssNano]))
    .pipe(gulp.dest(destStylesFolder + "/min"));

const processJs = () => gulp
    .src(srcScripts)
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(gulp.dest(destScriptsFolder))
    .pipe(uglify().on("error", e => { logError(e); }))
    .pipe(gulp.dest(destScriptsFolder + "/min"));

const copyLib = () => gulp
    .src(["node_modules/vue/dist/vue.min.js", "node_modules/chart.js/dist/Chart.min.js"])
    .pipe(gulp.dest(destScriptsFolder + "/lib"));

const serveSite = done => {
    server.init({
        server: {
            baseDir: distRoot
        }
    });
    done();
};

const reloadServer = done => {
    server.reload();
    done();
};

// Watchers
const watchSrc = () => gulp.watch(srcFiles, { verbose: true }, gulp.series(copyFiles, reloadServer));
const watchCss = () => gulp.watch([srcStyles].concat(cssOutputFiles), { verbose: true }, gulp.series(processCss, reloadServer));
const watchJs = () => gulp.watch(srcScripts, { verbose: true }, gulp.series(processJs, reloadServer));

// Sequences
const frontend = gulp.parallel(copyFiles, processCss, processJs, copyLib);
const watch = gulp.parallel(watchSrc, watchCss, watchJs);
const build = gulp.series(clean, frontend);

// Exports
exports.frontend = frontend;
exports.watch = watch;
exports.build = build;
exports.default = gulp.series(build, serveSite, watch);