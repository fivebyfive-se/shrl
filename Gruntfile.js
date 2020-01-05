module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    babel: {
      options: {
        sourceMap: false,
        presets: ['@babel/preset-env'],
        plugins: [
          '@babel/plugin-transform-regenerator', 
          '@babel/plugin-transform-async-to-generator'
        ]
      },
      dist: {
        files: {
          'public/js/home.js': 'src/js/home.js',
          'public/js/accordion.js': 'src/js/accordion.js'
        }
      }
    },
    sass: {
      dist: {
        files: {
          'public/css/style.css': 'src/scss/style.scss'
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-sass');
  
  grunt.registerTask('build', ['babel', 'sass']);
  grunt.registerTask('default', ['build']);  
};
