var express = require("express");
var ExpressPinoLogger = require("express-pino-logger");
var uuid = require("uuid-v4");
var mustacheExpress = require("mustache-express");
var bodyParser = require("body-parser");
var _ = require("lodash");
var redis = require("redis");
var bluebird = require("bluebird");
var app = express();

const prefix = process.env.MICROS_ENV === "local" ? "redis://" : "rediss://";
const url = process.env.REDISX_CONNECT_INSPECTOR_HOST
   ? `${prefix}${process.env.REDISX_CONNECT_INSPECTOR_HOST}:${process.env.REDISX_CONNECT_INSPECTOR_PORT}`
   : undefined;
const password = process.env.REDISX_CONNECT_INSPECTOR_PASSWORD || undefined;

var rc = redis.createClient({ url, password });

// Wrap redis in bluebird promises
bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

// JSON Logging
var obfuscate = [
   "req.headers.cookie",
   "req.headers.referer",
   "req.headers.authorization",
   "referer",
   "msg",
];

const pino = ExpressPinoLogger({
   redact: obfuscate,
});

app.use(pino);

// Register '.mustache' extension with The Mustache Express
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

// Register static resources
app.use("/static/images", express.static("static/images"));
app.use("/static/js", express.static("static-js"));
app.use("/static/css", express.static("static-css"));

app.use(bodyParser.text());
app.use(bodyParser.json());

// Variables for setting up this addon
var serverPort = process.env.PORT || 8080;
var hostUrl = process.env.HOST_URL || "http://localhost:" + serverPort;

var addonManager = (function () {
   var addons = {};

   var rName = function (addonKey, prop) {
      return addonKey + ":" + prop;
   };

   var dayInSeconds = 60 * 60 * 24;

   var expTime = 3 * dayInSeconds;

   var createAddon = function () {
      var addonKey = uuid();
      rc.set(rName(addonKey, "exists"), "true", "ex", expTime, redis.print);
      return addonKey;
   };

   var deleteAddon = function (addonKey) {
      rc.del(rName(addonKey, "exists"));
      rc.del(rName(addonKey, "logs"));
   };

   var hasAddon = function (addonKey) {
      return rc.existsAsync(rName(addonKey, "exists"));
   };

   var getLogs = function (addonKey) {
      return rc
         .lrangeAsync(rName(addonKey, "logs"), 0, -1)
         .then(function (res) {
            return _.map(res, JSON.parse);
         });
   };

   var log = function (addonKey, logData) {
      logData.id = uuid();
      var logName = rName(addonKey, "logs");
      rc.lpush(logName, JSON.stringify(logData));
      if (logData.tag === "installed") {
         rc.expire(logName, expTime);
      }
   };

   return {
      create: createAddon,
      delete: deleteAddon,
      hasAddon: hasAddon,
      log: log,
      getLogs: getLogs,
   };
})();

app.get("/", function (req, res) {
   res.redirect("/page/start");
});

app.get("/heartbeat", function (req, res) {
   res.sendStatus(200);
});

app.get("/page/start", function (req, res) {
   res.render("start");
});

app.get("/page/addon", function (req, res) {
   res.render("addon", {
      hostUrl: hostUrl,
      addonKey: req.query.addonKey,
   });
});

app.post("/addon", function (req, res) {
   var addonKey = addonManager.create();

   res.json({
      addonKey: addonKey,
   });
});

app.get("/addon/:addonKey", function (req, res) {
   var r = addonManager.hasAddon(req.params.addonKey);

   r.then(function (data) {
      res.json({
         active: data,
      });
   });

   r.error(function () {
      res.json({
         active: false,
      });
   });
});

app.delete("/addon/:addonKey", function (req, res) {
   addonManager.delete(req.params.addonKey);
   res.sendStatus(200);
});

app.get("/addon/:addonKey/logs", function (req, res) {
   var logsRequest = addonManager.getLogs(req.params.addonKey);

   logsRequest.then(function (logs) {
      res.json({
         addonKey: req.param.addonKey,
         logs: logs,
      });
   });
});

var resources = express.Router();

resources.get("/:addonKey/atlassian-connect.json", function (req, res) {
   var addonKey = req.params.addonKey;
   var hasAddonRequest = addonManager.hasAddon(addonKey);

   const commonWebhooks = [
      "app_policy_changed",
      "app_access_to_objects_blocked",
      "app_access_to_objects_in_container_blocked",
      "connect_addon_disabled",
      "connect_addon_enabled",
   ];

   var jiraWebhooks = [
      "attachment_created",
      "attachment_deleted",
      "user_created",
      "user_deleted",
      "user_updated",
      "jira:issue_created",
      "jira:issue_deleted",
      "jira:issue_updated",
      "jira:worklog_updated",
      "jira:version_created",
      "jira:version_deleted",
      "jira:version_merged",
      "jira:version_updated",
      "jira:version_moved",
      "jira:version_released",
      "jira:version_unreleased",
      "issuelink_created",
      "issuelink_deleted",
      "issue_property_set",
      "issue_property_deleted",
      "filter_created",
      "filter_updated",
      "filter_deleted",
      "project_created",
      "project_updated",
      "project_deleted",
      "project_app_enabled",
      "project_app_disabled",
      "option_voting_changed",
      "option_watching_changed",
      "option_unassigned_issues_changed",
      "option_subtasks_changed",
      "option_attachments_changed",
      "option_issuelinks_changed",
      "option_timetracking_changed",
      "comment_created",
      "comment_deleted",
      "comment_updated",
      "worklog_created",
      "worklog_deleted",
      "worklog_updated",
   ];

   var confluenceWebhooks = [
      "app_policy_changed",
      "attachment_archived",
      "attachment_created",
      "attachment_removed",
      "attachment_restored",
      "attachment_trashed",
      "attachment_unarchived",
      "attachment_updated",
      "attachment_viewed",
      "blog_created",
      "blog_moved",
      "blog_removed",
      "blog_restored",
      "blog_trashed",
      "blog_updated",
      "blog_viewed",
      "blueprint_page_created",
      "comment_created",
      "comment_removed",
      "comment_updated",
      "content_created",
      "content_removed",
      "content_restored",
      "content_trashed",
      "content_updated",
      "content_permissions_updated",
      "group_created",
      "group_removed",
      "label_added",
      "label_created",
      "label_deleted",
      "label_removed",
      "page_archived",
      "page_children_reordered",
      "page_copied",
      "page_created",
      "page_moved",
      "page_removed",
      "page_restored",
      "page_snapshotted",
      "page_started",
      "page_published",
      "page_initialized",
      "page_trashed",
      "page_unarchived",
      "page_updated",
      "page_viewed",
      "plugin_enabled",
      "relation_created",
      "relation_deleted",
      "search_performed",
      "space_created",
      "space_logo_updated",
      "space_permissions_updated",
      "space_removed",
      "space_trashed",
      "space_updated",
      "theme_enabled",
      "user_followed",
      "user_reactivated",
      "user_removed",
   ];

   const allWebhookModules = [
      ...commonWebhooks,
      ...jiraWebhooks,
      ...confluenceWebhooks,
   ].map((webhook) => {
      return {
         event: webhook,
         url: "/log-save/" + webhook,
      };
   });

   var linkBackForLocation = function (product, location) {
      return {
         key: "log-messages-link-" + product,
         name: { value: "Connect inspector logs" },
         location: location,
         tooltip: {
            value:
               "Go and look at all of the event messages that have been sent to your connect inspector add-on. (" +
               addonKey +
               ")",
         },
         url: hostUrl + "/page/addon?addonKey=" + addonKey,
         weight: 1000,
      };
   };

   var descriptor = {
      key: "ac.ci." + addonKey,
      name: "Connect Inspector (" + addonKey + ")",
      baseUrl: hostUrl + "/resources/" + addonKey,
      description:
         "Connect inspector to see into the requests that your atlassian-connect add-on is making.",
      lifecycle: {
         installed: "/log-save/installed",
         uninstalled: "/log-save/uninstalled",
         enabled: "/log-save/enabled",
         disabled: "/log-save/disabled",
      },
      authentication: {
         type: "jwt",
      },
      scopes: ["read"],
      links: {
         self: hostUrl + "/addon/" + addonKey,
      },
      modules: {
         webhooks: allWebhookModules,
         webItems: [
            linkBackForLocation("jira", "system.top.navigation.bar"),
            linkBackForLocation("confluence", "system.header/left"),
         ],
      },
      enableLicensing: false,
      apiMigrations: {
         gdpr: true,
         "signed-install": true,
      },
   };

   var fail = function () {
      res.sendStatus(404);
   };

   hasAddonRequest.then(function (hasAddon) {
      if (hasAddon) {
         res.json(descriptor);
      } else {
         fail();
      }
   }, fail);
});

resources.all("/:addonKey/log-save/:tag", function (req, res) {
   var addonKey = req.params.addonKey;
   var hasAddonRequest = addonManager.hasAddon(addonKey);

   var fail = function () {
      res.sendStatus(404);
   };

   hasAddonRequest.then(function (hasAddon) {
      if (hasAddon) {
         var queryArray = _.map(_.keys(req.query), function (key) {
            return {
               key: key,
               value: req.query[key],
            };
         });

         addonManager.log(addonKey, {
            tag: req.params.tag,
            method: req.method,
            headers: req.headers,
            query: queryArray,
            body: req.body,
            timestamp: new Date(),
         });

         res.sendStatus(204);
      } else {
         fail();
      }
   }, fail);
});

app.use("/resources", resources);

var server = app.listen(serverPort, function () {
   var host = server.address().address;
   var port = server.address().port;
});
