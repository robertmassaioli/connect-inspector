var _ = require("lodash");

module.exports = function (grunt) {
   var toModule = function (name) {
      return { name: name };
   };

   var toModules = function (names) {
      return _.map(names, toModule);
   };

   var buildJsOptions = {
      optimize: "none",
      appDir: "static/js",
      baseUrl: ".",
      dir: "static-js",
      paths: {
         underscore: "lib/underscore",
      },
      shim: {
         jquery: {
            deps: [],
            exports: "$",
         },
         aui: {
            deps: ["jquery"],
            exports: "AJS",
         },
      },
      wrapShim: true,
      modules: toModules(["app/start", "app/addon"]),
   };

   var prodJsOptions = _.merge({}, buildJsOptions, {
      optimize: "uglify2",
   });

   var buildCssOptions = {
      files: {
         "static-css/all.css": "static/less/all.less",
      },
   };

   var prodCssOptions = _.merge({}, buildCssOptions, {
      options: {
         compress: true,
      },
   });

   grunt.initConfig({
      pkg: grunt.file.readJSON("package.json"),
      requirejs: {
         compile: {
            options: buildJsOptions,
         },
         prod: {
            options: prodJsOptions,
         },
      },
      less: {
         compile: buildCssOptions,
         prod: prodCssOptions,
      },
      express: {
         dev: {
            options: {
               script: "index.js",
               port: process.env.PORT || 8080,
            },
         },
      },
      watch: {
         express: {
            files: ["Gruntfile.js", "index.js", "views/*.mustache"],
            tasks: ["express:dev"],
            options: {
               spawn: false,
            },
         },
         requirejs: {
            files: ["Gruntfile.js", "static/js/**/*.js"],
            tasks: ["requirejs:compile"],
         },
         less: {
            files: ["static/less/**/*.less"],
            tasks: ["less:compile"],
         },
      },
   });

   // Load the plugin that provides the "uglify" task.
   grunt.loadNpmTasks("grunt-contrib-uglify");
   grunt.loadNpmTasks("grunt-express-server");
   grunt.loadNpmTasks("grunt-contrib-watch");
   grunt.loadNpmTasks("grunt-contrib-requirejs");
   grunt.loadNpmTasks("grunt-contrib-less");

   // Default task(s).
   grunt.registerTask("default", [
      "requirejs:compile",
      "less:compile",
      "express:dev",
      "watch",
   ]);
};
