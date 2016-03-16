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
        this.sizeOfPage = 100;
        this.dataSource = {
            pageSize: this.sizeOfPage,
            rowCount: -1,
            overflowSize: 4,
            maxConcurrentRequests: 2,
            getRows: this.scrollElastic.bind(this)
        };
        this.scrollId = "";
    }
    ElasticService.prototype.listIndices = function () {
        return this._http.get('http://localhost:9200/_stats/index,store')
            .map(function (res) { return res.json(); })
            .map(function (res) {
            return Object.getOwnPropertyNames(res.indices);
        });
    };
    ElasticService.prototype.listAllLogs = function () {
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
            size: this.sizeOfPage
        };
        var requestoptions = new http_1.RequestOptions({
            method: http_1.RequestMethod.Post,
            url: url,
            body: JSON.stringify(body)
        });
        return this._http.request(new http_1.Request(requestoptions));
    };
    ElasticService.prototype.scrollElastic = function (params) {
        var _this = this;
        console.log('asking for ' + params.startRow + ' to ' + params.endRow);
        if (!this.scrollId) {
            this.listAllLogs().subscribe(function (res) {
                var data = _this.elasticLogProcessing(res);
                params.successCallback(data.slice());
            });
        }
        else {
            var body = {
                "scroll": "1m",
                "scroll_id": this.scrollId
            };
            var url = ES_URL + '/_search/scroll';
            var requestoptions = new http_1.RequestOptions({
                method: http_1.RequestMethod.Post,
                url: url,
                body: JSON.stringify(body)
            });
            this._http.request(new http_1.Request(requestoptions)).subscribe(function (res) {
                var data2 = _this.elasticLogProcessing(res);
                params.successCallback(data2.slice());
            }, function (err) { return console.log(err); });
        }
    };
    ElasticService.prototype.elasticLogProcessing = function (res) {
        var rowData = [];
        var data = res.json();
        var id = data._scroll_id;
        this.scrollId = id;
        for (var _i = 0, _a = data.hits.hits; _i < _a.length; _i++) {
            var logEntry = _a[_i];
            var type = logEntry._type;
            var time = logEntry._source['@timestamp'];
            var message = logEntry._source.message;
            var level = logEntry._source.level || logEntry._source.loglevel;
            var thread = logEntry._source.thread_name || logEntry._source.threadid;
            var logger = logEntry._source.logger_name || logEntry._source.loggername;
            var host = logEntry._source.host;
            var logValue = { type: type, time: time, message: message, level: level, thread: thread, logger: logger, host: host };
            rowData.push(logValue);
        }
        return rowData;
    };
    ElasticService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], ElasticService);
    return ElasticService;
})();
exports.ElasticService = ElasticService;
//# sourceMappingURL=elastic.service.js.map