var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("angular2/core");
var http_1 = require('angular2/http');
var ES_URL = 'http://127.0.0.1:9200/';
var INDEX = "<logstash-*>";
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
        var url = ES_URL + INDEX + '/_search?scroll=1m&filter_path=_scroll_id,hits.hits._source,hits.hits._type';
        var body = {
            sort: [
                { "@timestamp": "desc" }
            ],
            query: {
                "filtered": {
                    "filter": {
                        "bool": {
                            "must": [
                                { "range": {
                                        "@timestamp": {
                                            "gte": "now-20d",
                                            "lte": "now" }
                                    }
                                },
                                { "bool": { "should": [
                                            { "exists": { "field": "thread_name" } },
                                            { "exists": { "field": "threadid" } }
                                        ]
                                    }
                                },
                                { "bool": { "should": [
                                            { "exists": { "field": "logger_name" } },
                                            { "exists": { "field": "loggername" } }
                                        ]
                                    }
                                },
                                { "bool": { "should": [
                                            { "exists": { "field": "loglevel" } },
                                            { "exists": { "field": "level" } }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            size: "50",
        };
        var requestoptions = new http_1.RequestOptions({
            method: http_1.RequestMethod.Post,
            url: url,
            body: JSON.stringify(body)
        });
        return this._http.request(new http_1.Request(requestoptions));
    };
    ElasticService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], ElasticService);
    return ElasticService;
})();
exports.ElasticService = ElasticService;
//# sourceMappingURL=elastic.service.js.map