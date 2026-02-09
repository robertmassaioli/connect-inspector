define(['../lib/clipboard', '../helpers/MustacheLoader', '../lib/moment'], function(Clipboard, ML, moment) {
   AJS.$(function() {
      var clipboard = new Clipboard('.clipboard');

      AJS.$(".tooltip").tooltip({
         trigger: 'manual'
      });

      clipboard.on('success', function(e) {
         var trigger = AJS.$(e.trigger);

         trigger.tooltip("show");
         setTimeout(function() {
            trigger.tooltip("hide");
         }, 3000);
      });

      var decodeJwt = function(log) {
         var jwtToken;

         // Extract the JWT Token
         if(!jwtToken && !!log.query) jwtToken = log.query.jwt;
         if(!jwtToken && !!log.headers) {
            jwtToken = log.headers['authorization'];
            if(jwtToken) jwtToken = jwtToken.substring(4);
         }

         // Parse the jwt token
         if(jwtToken) {
            var sections = jwtToken.split('.');
            var parseSection = function(s) {
               return JSON.parse(atob(s));
            };
            jwtToken = {
               header: parseSection(sections[0]),
               payload: parseSection(sections[1]),
               sig: sections[2]
            };
         }

         return jwtToken;
      };

      var templates = ML.load();

      var getMeta = function(name) {
         return AJS.$('meta[name=' + name + ']').attr('content');
      };

      var addonKey = getMeta('addon-key');
      var addonBaseUrl = '/addon/' + addonKey;

      var getLogs = function() {
         return AJS.$.ajax({
            url: addonBaseUrl + '/logs',
            type: "GET",
            cache: false
         });
      };

      var reloadPage = function() {
         var addonActiveRequest = AJS.$.ajax({
            url: addonBaseUrl,
            type: 'GET',
            cache: false
         });

         addonActiveRequest.done(function(addon) {
            if(addon.active) {
               startLogLoop();
            } else {
               // Show the error dialog and then redirect people to the start page
               var addonStatus = AJS.$("#addon-status");
               addonStatus.removeClass('aui-lozenge-success').addClass('aui-lozenge-error');
               addonStatus.text("Add-on inactive");
               setTimeout(function() {
                  window.location.href = '/page/start'
               }, 1000);
            }
         });

         addonActiveRequest.fail(function() {
            // TODO what do we do when this request fails?
         });
      };

      reloadPage();

      AJS.$(window).focus(function() {
         if(currentLogLoop) clearTimeout(currentLogLoop);
         currentLogLoop = null;

         reloadPage();
      });

      AJS.$(window).blur(function() {
         if(currentLogLoop) clearTimeout(currentLogLoop);
         currentLogLoop = null;
      });

      var prettyJson = function(data) {
         return JSON.stringify(data, null, '  ');
      };

      // Wether or not we have loaded this log line before
      var hasLoadedLog = {};

      var loadLogs = function() {
         var logsRequest = getLogs();

         logsRequest.done(function(logsData) {
            var logsDiv = AJS.$("#addon-logs");
            logsDiv.toggleClass('hidden', logsData.logs.length <= 0);
            AJS.$("#no-logs").toggleClass('hidden', logsData.logs.length > 0);
            AJS.$.each(logsData.logs.reverse(), function(i, log) {
               if(!hasLoadedLog[log.id]) {
                  hasLoadedLog[log.id] = true;

                  // Prettify the timestamp
                  var timestamp = moment(log.timestamp);
                  log.prettyTimestamp = timestamp.format("DD MMM YYYY hh:mm:ssA Z");

                  // Parse the JWT token
                  log.jwtToken = decodeJwt(log);
                  if(log.jwtToken) {
                     log.jwtToken.prettyHeader = prettyJson(log.jwtToken.header);
                     log.jwtToken.prettyPayload = prettyJson(log.jwtToken.payload);
                  }

                  // Pretty body
                  log.prettyBody = prettyJson(log.body);

                  // Render the log line
                  logsDiv.prepend(templates.render('log-line', log));
               }
            });
            AJS.$(".tooltip-auto").tooltip();
         });

         logsRequest.fail(function() {
            // TODO throw some message if we fail to get the logs
         });
      };

      var currentLogLoop;

      var startLogLoop = function() {
         loadLogs();
         currentLogLoop = setTimeout(startLogLoop, 4000);
      };

      // Handle opening and closing the jwt blocks
      var handleOpen = function(openSelector, toOpenSelector) {
         AJS.$("#addon-logs").on('click', openSelector, function() {
            var self = AJS.$(this);
            var container = self.closest('.log-line');
            var jwtContainer = container.find(toOpenSelector);

            var isHidden = jwtContainer.hasClass('hidden');
            jwtContainer.toggleClass('hidden', !isHidden);
            var icon = container.find('.aui-icon' + openSelector);
            icon.toggleClass('aui-iconfont-collapsed', !isHidden);
            icon.toggleClass('aui-iconfont-arrow-down', isHidden);
         });
      };

      handleOpen('.open-jwt', '.jwt-data');
      handleOpen('.open-body', '.body');
      handleOpen('.open-query-params', '.query-params');
   });
});
