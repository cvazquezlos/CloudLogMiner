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
var ES_URL = 'http://jenkins:jenkins130@elasticsearch.kurento.org:9200/';
var INDEX = "<kurento-*>";
var ElasticService = (function () {
    function ElasticService(_http) {
        this._http = _http;
        this.scroll = { id: "", search: false };
        this.fields = {
            level: "",
            logger: "",
            thread: ""
        };
    }
    ElasticService.prototype.listIndices = function () {
        return this._http.get('http://localhost:9200/_stats/index,store')
            .map(function (res) { return res.json(); })
            .map(function (res) {
            return Object.getOwnPropertyNames(res.indices);
        });
    };
    ElasticService.prototype.listAllLogs = function (sizeOfPage) {
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
                                            "gte": "now-200d",
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
            size: sizeOfPage
        };
        var requestoptions = new http_1.RequestOptions({
            method: http_1.RequestMethod.Post,
            url: url,
            body: JSON.stringify(body)
        });
        return this._http.request(new http_1.Request(requestoptions));
    };
    ElasticService.prototype.scrollElastic = function () {
        var body = {
            "scroll": "1m",
            "scroll_id": this.scroll.id
        };
        var url = ES_URL + '_search/scroll';
        var requestoptions = new http_1.RequestOptions({
            method: http_1.RequestMethod.Post,
            url: url,
            body: JSON.stringify(body)
        });
        return this._http.request(new http_1.Request(requestoptions));
    };
    ElasticService.prototype.getRowsDefault = function (sizeOfPage) {
        if (!this.scroll.id && !this.scroll.search) {
            return this.listAllLogs(sizeOfPage);
        }
        else {
            return this.scrollElastic();
        }
    };
    ElasticService.prototype.firstSearch = function (value, sizeOfPage) {
        this.scroll.search = true;
        var body = {
            "query": {
                "multi_match": {
                    "query": value,
                    "type": "best_fields",
                    "fields": ["type", "host", "message", this.fields.level, this.fields.logger, this.fields.thread],
                    "tie_breaker": 0.3,
                    "minimum_should_match": "30%"
                }
            },
            size: sizeOfPage,
            sort: [
                "_score"
            ]
        };
        var url = ES_URL + INDEX + '/_search?scroll=1m';
        var requestoptions = new http_1.RequestOptions({
            method: http_1.RequestMethod.Post,
            url: url,
            body: JSON.stringify(body)
        });
        return this._http.request(new http_1.Request(requestoptions));
    };
    ElasticService.prototype.search = function (value, sizeOfPage) {
        if (!(this.scroll.id && this.scroll.search)) {
            return this.firstSearch(value, sizeOfPage);
        }
        else if (this.scroll.id && this.scroll.search) {
            return this.scrollElastic();
        }
    };
    ElasticService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], ElasticService);
    return ElasticService;
})();
exports.ElasticService = ElasticService;
//# sourceMappingURL=elastic.service.js.map