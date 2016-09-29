
module.exports = function(grunt) {
    "use strict";

    require('load-grunt-tasks')(grunt);
    grunt.initConfig({
        concat: {
            main: {
                src: [
                    "scripts/lib/**/*.js",
                    "scripts/core/*.js"
                ],
                dest: "build/wgecore.js"
            }
        },
        uglify: {
            main: {
                files: {
                    "build/wgecore.js": "build/wgecore.js"
                }
            }
        },
        babel: {
            options: {
                sourceMap: true,
                presets: [
                    "babel-preset-es2015"
                ]
            },
            dist: {
                files: {
                    "build/wgecore.js": "<%=  concat.main.dest %>"
                }
            }
        }
    });

    grunt.registerTask("default", ["concat", "babel", "uglify"]);
    grunt.registerTask("dev", ["concat", "babel"]);
};