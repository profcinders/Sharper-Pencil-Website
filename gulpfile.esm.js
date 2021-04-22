import gulp from "gulp";
import del from "del";
import babel from "gulp-babel";
import { minify as terserMinify } from "terser"
import jsCompressor from "gulp-terser";
import postCss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import tailwind from "tailwindcss";
import csso from "postcss-csso"
import browserSync from "browser-sync";

const server = browserSync.create();

// File locations
const siteRoot = "./src";
const distRoot = "./dist";

const assetsRoot = "/assets";
const destStylesFolder = distRoot + assetsRoot + "/css";
const destScriptsFolder = distRoot + assetsRoot + "/js";
const srcFiles = [siteRoot + "/**/*.html", siteRoot + assetsRoot + "/images/**/*.*"];
const srcStyles = siteRoot + assetsRoot + "/css/style.css";
const srcScripts = siteRoot + assetsRoot + "/js/**/*.js";
const cssOutputFiles = [siteRoot + "/**/*.html", srcScripts];

// Tasks
const clean = done =>
    del([distRoot], done);

const copyFiles = () => gulp
    .src(srcFiles, { base: siteRoot })
    .pipe(gulp.dest(distRoot));

const processCss = inProd => {
    let task = () => gulp
        .src(srcStyles)
        .pipe(postCss([tailwind({ purge: { enabled: inProd, content: cssOutputFiles } }), autoprefixer]))
        .pipe(gulp.dest(destStylesFolder))
        .pipe(postCss([csso]))
        .pipe(gulp.dest(destStylesFolder + "/min"));
    Object.assign(task, { displayName: "processCss" });
    return task;
};

const processJs = () => gulp
    .src(srcScripts)
    .pipe(babel({ presets: ["@babel/preset-env"] }))
    .pipe(gulp.dest(destScriptsFolder))
    .pipe(jsCompressor({}, terserMinify))
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
const frontend = inProd => gulp.parallel(copyFiles, processCss(inProd), processJs, copyLib);
const watch = gulp.parallel(watchSrc, watchCss, watchJs);
const buildDev = gulp.series(clean, frontend(false));
const buildProd = gulp.series(frontend(true));

// Exports
exports.frontend = frontend(false);
exports.watch = watch;
exports.build = buildProd;
exports.default = gulp.series(buildDev, serveSite, watch);