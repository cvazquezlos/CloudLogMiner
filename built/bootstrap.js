"use strict";
/**
 * Created by silvia on 26/2/16.
 */
var browser_1 = require('angular2/platform/browser');
var app_component_1 = require('./app/app.component');
var http_1 = require('angular2/http');
var elastic_service_1 = require('./app/elastic.service');
browser_1.bootstrap(app_component_1.AppComponent, [http_1.HTTP_PROVIDERS, elastic_service_1.ElasticService])
    .catch(function (err) { return console.log(err); }); // useful to catch the errors
//# sourceMappingURL=bootstrap.js.map