import gulp from "gulp";
import { deleteAsync as del } from "del";
import postCss from "gulp-postcss";
import autoprefixer from "autoprefixer";
import tailwind from "tailwindcss";
import csso from "postcss-csso"
import browserSync from "browser-sync";
import esBuild from "gulp-esbuild";
import esbVue from "esbuild-plugin-vue3";

const server = browserSync.create();

// File locations
const siteRoot = "./src";
const distRoot = "./dist";

const assetsRoot = "/assets";
const destStylesFolder = distRoot + assetsRoot + "/css";
const destScriptsFolder = distRoot + assetsRoot + "/js";
const srcFiles = [siteRoot + "/**/*.html", siteRoot + assetsRoot + "/images/**/*.*"];
const srcStyles = siteRoot + assetsRoot + "/css/**/*.*";
const srcScripts = siteRoot + assetsRoot + "/js/**/*.*";
const styleEntryPoints = siteRoot + assetsRoot + "/css/style.css";
const scriptEntryPoints = siteRoot + assetsRoot + "/js/*.js";
const cssOutputFiles = [siteRoot + "/**/*.html", srcScripts];

// Tasks
const clean = () =>
    del([distRoot]);

const copyFiles = () => gulp
    .src(srcFiles, { base: siteRoot })
    .pipe(gulp.dest(distRoot));

const processCss = inProd => {
    let task = () => gulp
        .src(styleEntryPoints)
        .pipe(postCss([tailwind({ purge: { enabled: inProd, content: cssOutputFiles } }), autoprefixer]))
        .pipe(gulp.dest(destStylesFolder))
        .pipe(postCss([csso]))
        .pipe(gulp.dest(destStylesFolder + "/min"));
    Object.assign(task, { displayName: "processCss" });
    return task;
};

const processJs = inProd => {
    let task = () => gulp
        .src(scriptEntryPoints)
        .pipe(esBuild(
            {
                bundle: true,
                minify: inProd,
                treeShaking: inProd,
                plugins: [ esbVue() ]
            }))
        .pipe(gulp.dest(destScriptsFolder));
    Object.assign(task, { displayName: "processJs" });
    return task;
}

const serveSite = done => {
    server.init({
        server: {
            baseDir: distRoot,
            serveStaticOptions: {
                extensions: ["html"]
            }
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
const watchCss = () => gulp.watch([srcStyles].concat(cssOutputFiles), { verbose: true }, gulp.series(processCss(false), reloadServer));
const watchJs = () => gulp.watch(srcScripts, { verbose: true }, gulp.series(processJs(false), reloadServer));

// Sequences
const frontend = inProd => gulp.parallel(copyFiles, processCss(inProd), processJs(inProd));
const watch = gulp.parallel(watchSrc, watchCss, watchJs);
const buildDev = gulp.series(clean, frontend(false));
const buildProd = gulp.series(frontend(true));

// Exports
export { watch, buildProd as build, clean };
export default gulp.series(buildDev, serveSite, watch);