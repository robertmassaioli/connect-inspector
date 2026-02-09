define(['../lib/mustache'], function(Mustache) {
   "use strict";

   var loadTemplates = function() {
      var selector = "script[type='x-tmpl-mustache']";
      var rawTemplates = AJS.$(selector);

      var parsedTemplates = {};
      AJS.$.each(rawTemplates, function(i, rawTemplate) {
         var $template = AJS.$(rawTemplate);
         var templateId = $template.attr('id');
         parsedTemplates[templateId] = $template.html();
         Mustache.parse(parsedTemplates[templateId]);
      });

      var render = function(templateId, vars) {
         return Mustache.render(parsedTemplates[templateId], vars);
      };

      var fst = function(a, b) { return a; };
      var snd = function(a, b) { return b; };

      var listTemplates = function() {
         return AJS.$.map(parsedTemplates, snd);
      };

      return {
         list: listTemplates,
         render: render
      };
   };

   return {
      load: loadTemplates
   };
});
