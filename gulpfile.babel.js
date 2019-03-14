import gulp from "gulp";
import { run } from "./scripts/Gulp/powershell";
import file from "./scripts/Gulp/files";
import sass from "gulp-sass";
import autoprefixer from "gulp-autoprefixer";
import uglify from "gulp-uglify-es";
import * as log from "./scripts/Gulp/log";
import purgecss from "gulp-purgecss";

sass.compiler = require("node-sass");

var siteName = "sharper-pencil";
var siteRoot = "./src";
var stylesFolder = siteRoot + "/assets/css";
var sassFiles = stylesFolder + "/**/*.scss";
var scriptsFolder = siteRoot + "/assets/js";
var jsFiles = [scriptsFolder + "/**/*.js", "!" + scriptsFolder + "/min{,/**}"];

// Tasks
gulp.task("Setup-Local-IIS", done =>
    run(`./scripts/Powershell/site-setup.ps1 -projectName '${siteName}' -sitePath '${file.absPath(siteRoot)}'`, done));

gulp.task("Process-Sass", () =>
    gulp.src(sassFiles)
        .pipe(sass({ includePaths: [stylesFolder, "./node_modules"], outputStyle: 'compressed' }).on("error", sass.logError))
        .pipe(autoprefixer())
        .pipe(purgecss({ content: ["src/**/*.html", "src/**/*.cshtml"] }))
        .pipe(gulp.dest(stylesFolder)));

gulp.task("Process-JS", () =>
    gulp.src(jsFiles)
        .pipe(uglify().on("error", (e) => { log.error(e); }))
        .pipe(gulp.dest(scriptsFolder + "\\min")));

// Watchers
gulp.task("Watch-Sass", () => gulp.watch(sassFiles, { verbose: true }, gulp.series("Process-Sass")));

gulp.task("Watch-JS", () => gulp.watch(jsFiles, { verbose: true }, gulp.series("Process-JS")));

// Sequences
gulp.task("frontend", gulp.parallel("Process-Sass", "Process-JS"));

gulp.task("setup", gulp.series("Setup-Local-IIS", "frontend"));

gulp.task("watch", gulp.parallel("Watch-Sass", "Watch-JS"));

gulp.task("default", gulp.series("frontend", "watch"));