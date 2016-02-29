var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 * Created by silvia on 26/2/16.
 */
var http_1 = require('angular2/http');
require('rxjs/add/operator/map');
var core_1 = require("angular2/core");
var ElasticService = (function () {
    function ElasticService(_http) {
        this._http = _http;
    }
    ElasticService.prototype.listIndices = function () {
        return this._http.get('http://localhost:9200/_stats/index,store')
            .map(function (res) { return res.json(); })
            .map(function (res) {
            return Object.getOwnPropertyNames(res.indices);
        });
    };
    ElasticService.prototype.listAllLogs = function (index) {
        return this._http.get("http://localhost:9200/" + index + "/_search?q=*&pretty")
            .map(function (responseData) {
            return responseData.json();
        })
            .map(function (answer) {
            var result = [];
            if (answer) {
                answer.hits.hits.forEach(function (log) {
                    result.push(log._source);
                });
            }
            return result;
        });
    };
    ElasticService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], ElasticService);
    return ElasticService;
})();
exports.ElasticService = ElasticService;
//# sourceMappingURL=elastic.service.js.map