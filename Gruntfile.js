const sass = require('node-sass');

module.exports = (grunt) => {
  require('load-grunt-tasks')(grunt);

  const watchOptions = {
    debounceDelay: 250,
    spawn: false,
  };

  grunt.initConfig({
    copy: {
      main: {
        files: [
          { expand: true, src: ['**'], dest: 'public/', cwd: 'client/static/'},
        ]
      }
    },
    babel: {
      options: {
        sourceMap: false,
        presets: ['@babel/preset-env'],
        plugins: [
          'babel-plugin-transform-async-to-promises'
        ]
      },
      dist: {
        files: {
          'public/js/home.js': 'client/src/js/home.js',
          'public/js/delete-button.js': 'client/src/js/delete-button.js',
          'public/js/accordion.js': 'client/src/js/accordion.js'
        }
      }
    },
    sass: {
      options: {
          implementation: sass,
          sourceMap: true
      },
      dist: {
        files: {
          'public/css/non-critical.css': 'client/src/scss/non-critical.scss',
          'public/css/critical.css': 'client/src/scss/critical.scss'
        }
      }
    },
    watch: {
      static: {
        files: ['client/static/**/*.*'],
        tasks: ['copy'],
        options: watchOptions
      },
      scripts: {
        files: ['client/src/**/*.js'],
        tasks: ['babel'],
        options: watchOptions,
      },
      style: {
        files: ['client/src/**/*.scss'],
        tasks: ['sass'],
        options: watchOptions,
      }
    },
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-copy');


  grunt.registerTask('build', ['babel', 'sass', 'copy']);
  grunt.registerTask('dev', ['build', 'watch']);
  grunt.registerTask('default', ['build']);
};
