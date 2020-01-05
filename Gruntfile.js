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
          'public/css/layout.css': 'src/scss/layout.scss',      
          'public/css/index.css': 'src/scss/index.scss',
          'public/css/accordion.css': 'src/scss/accordion.scss',
          'public/css/redirect.css': 'src/scss/redirect.scss',
          'public/css/user.css': 'src/scss/user.scss',
        }
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-sass');
  
  grunt.registerTask('build', ['babel', 'sass']);
  grunt.registerTask('default', ['build']);  
};
