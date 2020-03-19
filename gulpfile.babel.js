import gulp from "gulp";
import { run } from "./scripts/Gulp/powershell";
import file from "./scripts/Gulp/files";
import uglify from "gulp-uglify-es";
import * as log from "./scripts/Gulp/log";
import postCss from "gulp-postcss";
import postCssPreset from "postcss-preset-env";
import tailwind from "tailwindcss";
import unCss from "uncss";
import cssNano from "cssnano";

var siteName = "sharper-pencil";
var siteRoot = "./src";

var assetsRoot = siteRoot + "/assets";
var destStylesFolder = assetsRoot + "/css";
var destScriptsFolder = assetsRoot + "/js";
var srcStyles = assetsRoot + "/src/css/style.css";
var srcScripts = assetsRoot + "/src/js/**/*.js";
var htmlFiles = [siteRoot + "/**/*.html", siteRoot + "/**/*.cshtml"];

// Tasks
gulp.task("Setup-Local-IIS", done =>
    run(`./scripts/Powershell/site-setup.ps1 -projectName '${siteName}' -sitePath '${file.absPath(siteRoot)}'`, done));

gulp.task("Process-CSS", () => gulp
    .src(srcStyles)
    .pipe(postCss([tailwind, postCssPreset]))
    .pipe(gulp.dest(destStylesFolder))
    .pipe(postCss([unCss.postcssPlugin({ html: htmlFiles }), cssNano]))
    .pipe(gulp.dest(destStylesFolder + "/min")));

gulp.task("Process-JS", () => gulp
    .src(srcScripts)
    .pipe(gulp.dest(destScriptsFolder))
    .pipe(uglify().on("error", e => { log.error(e); }))
    .pipe(gulp.dest(destScriptsFolder + "/min")));

// Watchers
gulp.task("Watch-CSS", () => gulp.watch([srcStyles].concat(htmlFiles), { verbose: true }, gulp.series("Process-CSS")));

gulp.task("Watch-JS", () => gulp.watch(srcScripts, { verbose: true }, gulp.series("Process-JS")));

// Sequences
gulp.task("frontend", gulp.parallel("Process-CSS", "Process-JS"));

gulp.task("setup", gulp.series("Setup-Local-IIS", "frontend"));

gulp.task("watch", gulp.parallel("Watch-CSS", "Watch-JS"));

gulp.task("default", gulp.series("frontend", "watch"));