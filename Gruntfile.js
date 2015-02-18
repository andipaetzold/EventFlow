module.exports = function(grunt)
{
    var files = {
        css: {
            src:    "src/css/style.scss",
            dest:   "src/css/style.min.css"
        },
        js: {
            src:    "src/js/*.js",
            dest:   "src/js/eventflow.min.js"
        }
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),

        /* CSS */
        sass: {
            options: {
                sourcemap: "none",
                noCache: true
            },
            dist: {
                src:    files.css.src,
                dest:   files.css.dest
            }
        },
        autoprefixer: {
            dist: {
                src:    files.css.dest,
                dest:   files.css.dest
            }
        },
        cssmin: {
            dist: {
                src:    files.css.dest,
                dest:   files.css.dest
            }
        },

        /* JavaScript */
        uglify: {
            dist: {
                src:    files.js.src,
                dest:   files.js.dest
            }
        },

        concat: {
            dist: {
                src:    files.js.src,
                dest:   files.js.dest
            }
        },

        /* Watch */
        watch: {
            dist: {
                files: [files.css.src, files.js.src],
                tasks: "dev"
            }
        },

        /* Clean */
        clean: {
            dist: [
                files.css.dest,
                files.js.dest
            ]
        }
    });

    grunt.loadNpmTasks("grunt-autoprefixer");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");

    grunt.registerTask("dev", ["clean", "sass", "autoprefixer", "concat"]);
    grunt.registerTask("prod", ["dev", "cssmin", "uglify"]);
    grunt.registerTask("default", "watch");
};
