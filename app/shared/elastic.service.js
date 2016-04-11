/**
 * Created by silvia on 26/2/16.
 */
System.register(["angular2/core", 'angular2/http', 'rxjs/add/operator/map', 'rxjs/add/operator/mergeMap'], function(exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    var __metadata = (this && this.__metadata) || function (k, v) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
    };
    var core_1, http_1;
    var ES_URL, INDEX, ElasticService;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (http_1_1) {
                http_1 = http_1_1;
            },
            function (_1) {},
            function (_2) {}],
        execute: function() {
            /*
             const ES_URL = 'http://127.0.0.1:9200/';
             const INDEX = "<logstash-*>";*/
            ES_URL = 'http://jenkins:jenkins130@elasticsearch.kurento.org:9200/';
            INDEX = "<kurento-*>";
            ElasticService = (function () {
                function ElasticService(_http) {
                    this._http = _http;
                    this.scroll = { id: "", search: false }; //Elasticsearch scroll indicator
                    this.fields = {
                        level: "",
                        logger: "",
                        thread: ""
                    };
                    this.sizeOfPage = 100;
                    this.nResults = 0;
                    this.maxResults = 500;
                }
                ElasticService.prototype.listIndices = function () {
                    return this._http.get('http://localhost:9200/_stats/index,store')
                        .map(function (res) { return res.json(); })
                        .map(function (res) {
                        return Object.getOwnPropertyNames(res.indices);
                    });
                };
                ElasticService.prototype.listAllLogs = function (url, body) {
                    var _this = this;
                    var requestoptions = new http_1.RequestOptions({
                        method: http_1.RequestMethod.Post,
                        url: url,
                        body: JSON.stringify(body)
                    });
                    var url2 = ES_URL + '_search/scroll';
                    var requestoptions2 = new http_1.RequestOptions({
                        method: http_1.RequestMethod.Post
                    });
                    requestoptions2.body = JSON.stringify({
                        "scroll": "1m",
                        "scroll_id": this.scroll.id
                    });
                    requestoptions2.url = ES_URL + '_search/scroll';
                    var results = new core_1.EventEmitter();
                    this._http.request(new http_1.Request(requestoptions))
                        .map(function (responseData) { return responseData.json(); }) //Important include 'return' keyword
                        .map(function (answer) {
                        var id = answer._scroll_id;
                        _this.scroll.id = id;
                        answer = _this.mapLogs(answer);
                        return answer;
                    })
                        .subscribe(function (d) {
                        results.emit(d);
                        requestoptions2.body = JSON.stringify({
                            "scroll": "1m",
                            "scroll_id": _this.scroll.id
                        });
                        _this._http.request(new http_1.Request(requestoptions2))
                            .map(function (res) { return res.json(); })
                            .map(function (answ) {
                            answ = _this.mapLogs(answ);
                            return answ;
                        })
                            .subscribe(function (e) {
                            results.emit(e);
                        });
                    });
                    return results;
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
                ElasticService.prototype.getRowsDefault = function () {
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
                    return this.listAllLogs(url, body);
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
                ElasticService.prototype.mapLogs = function (answer) {
                    var result = [];
                    if (answer) {
                        for (var _i = 0, _a = answer.hits.hits; _i < _a.length; _i++) {
                            var a = _a[_i];
                            var b = this.elasticLogProcessing(a);
                            result.push(b);
                        }
                    }
                    return result;
                };
                ElasticService.prototype.elasticLogProcessing = function (logEntry) {
                    var type = logEntry._type;
                    var time = logEntry._source['@timestamp'];
                    var message = logEntry._source.message;
                    var level = logEntry._source.level || logEntry._source.loglevel;
                    if (logEntry._source.level) {
                        this.fields.level = "level";
                    }
                    else {
                        this.fields.level = "loglevel";
                    }
                    var thread = logEntry._source.thread_name || logEntry._source.threadid;
                    if (logEntry._source.thread_name) {
                        this.fields.thread = "thread_name";
                    }
                    else {
                        this.fields.thread = "threadid";
                    }
                    var logger = logEntry._source.logger_name || logEntry._source.loggername;
                    if (logEntry._source.logger_name) {
                        this.fields.logger = "logger_name";
                    }
                    else {
                        this.fields.logger = "loggername";
                    }
                    var host = logEntry._source.host;
                    var logValue = { type: type, time: time, message: message, level: level, thread: thread, logger: logger, host: host };
                    return logValue;
                };
                ElasticService = __decorate([
                    core_1.Injectable(), 
                    __metadata('design:paramtypes', [http_1.Http])
                ], ElasticService);
                return ElasticService;
            }());
            exports_1("ElasticService", ElasticService);
        }
    }
});
//# sourceMappingURL=elastic.service.js.map