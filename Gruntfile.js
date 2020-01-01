module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks

  grunt.initConfig({
    babel: {
      options: {
        sourceMap: true,
        presets: ['@babel/preset-env']
      },
      dist: {
        files: {
          'public/js/home.js': 'src/client/js/home.js'
        }
      }
    },
    sass: {
      dist: {
        files: {
          'public/css/style.css': 'src/client/scss/style.scss'
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-sass');
  
  grunt.registerTask('build', ['babel', 'sass']);
  grunt.registerTask('default', ['build']);  
};
