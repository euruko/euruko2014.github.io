module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        env: {
            dev: {
                NODE_ENV: 'dev'
            },
            prod: {
                NODE_ENV: 'prod'
            }
        },
        preprocess : {
            build : {
                src : 'source.html',
                dest : 'index.html'
            }
        },
        uglify: {
            build: {
                files: {
                    'js/_app.min.js' : [
                        'js/app/models/post.js',
                        'js/app/models/posts.js',

                        'js/app/views/blog.js',
                        'js/app/views/blogPost.js',
                        'js/app/views/main.js',
                        'js/app/views/nav.js',

                        'js/app/regions/content.js',
                        'js/app/regions/header.js',
                        'js/app/regions/postsList.js',

                        'js/app/controller.js',
                        'js/app/layout.js',
                        'js/app/module.js'
                    ]
                }
            }
        },
        cssmin: {
            build: {
                files: {
                    'css/_app.min.css': [
                        'css/style.css',
                        'css/animation.css',
                        'css/transition.css',
                        'css/height_up_to_600.css',
                        'css/height_up_to_700.css',
                        'css/height_up_to_900.css',
                        'css/width_up_to_1366.css',
                        'css/width_up_to_1600.css'
                    ]
                }
            }
        },
        compress: {
            main: {
                options: {
                    archive: 'release/euruko.zip',
                    mode: 'zip'
                },
                files: [
                    {
                        src: [
                            'blog/**',
                            'css/_app.min.css',
                            'css/img/**',
                            'js/libs/**',
                            'js/app/templates/**',
                            'js/_app.min.js',
                            'index.html'
                        ]
                    }
                ]
            }
        },
        watch: {
            main: {
                files: ['Gruntfile.js', 'js/**/*.js', 'css/*.css', 'source.html', '!js/_*.js', '!css/_*.css', 'jekyll/_posts/*'],
                tasks: 'build'
            }
        },
        jekyll: {                             // Task
            options: {                          // Universal options
                bundleExec: true,
                src : 'jekyll'
            },
            dist: {                             // Target
                options: {                        // Target options
                    dest: 'blog/data',
                    config: false,
                    permalink: false
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-compress');
    grunt.loadNpmTasks('grunt-env');
    grunt.loadNpmTasks('grunt-preprocess');
    grunt.loadNpmTasks('grunt-jekyll');

    grunt.registerTask('build', ['preprocess', 'cssmin', 'uglify', 'jekyll']);
    grunt.registerTask('buildP', ['env:prod', 'build']);
    grunt.registerTask('buildD', ['env:dev', 'build']);
    grunt.registerTask('release', ['env:prod', 'build', 'compress']);
    grunt.registerTask('default', ['env:dev', 'build', 'watch']);
};