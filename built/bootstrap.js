var browser_1 = require('angular2/platform/browser');
var app_component_1 = require('./component/app.component');
var elastic_service_1 = require('./service/elastic.service');
var http_1 = require("angular2/http");
browser_1.bootstrap(app_component_1.AppComponent, [elastic_service_1.ElasticService, http_1.HTTP_PROVIDERS]);
//# sourceMappingURL=bootstrap.js.map