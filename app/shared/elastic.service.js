/**
 * Created by silvia on 26/2/16.
 */
System.register(["angular2/core", 'angular2/http', 'rxjs/add/operator/map', "rxjs/Observable"], function(exports_1, context_1) {
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
    var core_1, http_1, Observable_1;
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
            function (Observable_1_1) {
                Observable_1 = Observable_1_1;
            }],
        execute: function() {
            ES_URL = 'http://127.0.0.1:9200/';
            INDEX = "<logstash-*>";
            /*
            const ES_URL = 'http://jenkins:jenkins130@elasticsearch.kurento.org:9200/';
            const INDEX = "<kurento-*>";*/
            ElasticService = (function () {
                function ElasticService(_http) {
                    this._http = _http;
                    this.scroll = ""; //Elasticsearch scroll indicator
                    this.fields = {
                        level: "",
                        logger: "",
                        thread: ""
                    };
                    this.sizeOfPage = 10;
                    this.nResults = 0;
                    this.maxResults = 50;
                    this.currentRequest = new http_1.RequestOptions();
                }
                ElasticService.prototype.listIndices = function () {
                    return this._http.get('http://localhost:9200/_stats/index,store')
                        .map(function (res) { return res.json(); })
                        .map(function (res) {
                        return Object.getOwnPropertyNames(res.indices);
                    });
                };
                ElasticService.prototype.listAllLogs = function (requestOptions, emitter) {
                    var _this = this;
                    this._http.request(new http_1.Request(requestOptions))
                        .map(function (responseData) { return responseData.json(); }) //Important include 'return' keyword
                        .map(function (answer) {
                        var id = answer._scroll_id;
                        _this.scroll = id; //id has to be assigned before mapLogs, which only returns the hits.
                        answer = _this.mapLogs(answer);
                        return answer;
                    })
                        .subscribe(function (batch) {
                        _this.nResults = _this.nResults + _this.sizeOfPage;
                        emitter.next(batch);
                        if (_this.nResults < _this.maxResults && batch.length == _this.sizeOfPage) {
                            var body2 = {
                                "scroll": "1m",
                                "scroll_id": _this.scroll
                            };
                            var url2 = ES_URL + '_search/scroll';
                            var requestOptions2 = new http_1.RequestOptions({
                                method: http_1.RequestMethod.Post,
                                url: url2,
                                body: JSON.stringify(body2)
                            });
                            _this.listAllLogs(requestOptions2, emitter);
                            return;
                        }
                        else {
                            _this.nResults = 0;
                            emitter.complete();
                        }
                    });
                    return;
                };
                ElasticService.prototype.getRowsDefault = function () {
                    var _this = this;
                    var url = ES_URL + INDEX + '/_search?scroll=1m&filter_path=_scroll_id,hits.hits._source,hits.hits._type';
                    var body = {
                        sort: [
                            { "@timestamp": "desc" }
                        ],
                        query: {
                            filtered: {
                                filter: {
                                    bool: {
                                        must: [
                                            { range: {
                                                    '@timestamp': {
                                                        gte: "now-200d",
                                                        lte: "now" }
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
                    var requestOptions = new http_1.RequestOptions({
                        method: http_1.RequestMethod.Post,
                        url: url,
                        body: JSON.stringify(body)
                    });
                    this.currentRequest = requestOptions;
                    var observable = Observable_1.Observable.create(function (observer) { return _this.listAllLogs(requestOptions, observer); });
                    return observable;
                };
                ElasticService.prototype.search = function (value, orderByRelevance) {
                    var _this = this;
                    var sort;
                    if (orderByRelevance) {
                        var options1 = "_score";
                        sort = [options1];
                    }
                    else {
                        var options2 = { '@timestamp': 'desc' };
                        sort = [options2];
                    }
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
                        size: this.sizeOfPage,
                        sort: sort
                    };
                    var url = ES_URL + INDEX + '/_search?scroll=1m';
                    var requestOptions2 = new http_1.RequestOptions({
                        method: http_1.RequestMethod.Post,
                        url: url,
                        body: JSON.stringify(body)
                    });
                    if (!orderByRelevance) {
                        this.currentRequest = requestOptions2;
                    }
                    else {
                        this.currentRequest = null;
                    }
                    var observable = Observable_1.Observable.create(function (observer) {
                        return _this.listAllLogs(requestOptions2, observer);
                    });
                    return observable;
                };
                ElasticService.prototype.loadMore = function (lastLog) {
                    if (this.currentRequest) {
                        var lastTime = lastLog.time || lastLog._source["@timestamp"];
                        var newBody = JSON.parse(this.currentRequest.body);
                        var lessThan = new Date(lastTime);
                        var greaterThan = new Date(lastTime);
                        greaterThan.setDate(greaterThan.getDate() - 200);
                        return this.loadByDate(lessThan, greaterThan);
                    }
                    else {
                        return Observable_1.Observable.create(function (ob) { ob.complete(); });
                    }
                };
                ElasticService.prototype.loadByDate = function (lessThan, greaterThan) {
                    var _this = this;
                    var newBody = JSON.parse(this.currentRequest.body);
                    var oldRequestGreaterThan;
                    if (lessThan instanceof Date) {
                        lessThan = lessThan.toISOString();
                        greaterThan = greaterThan.toISOString();
                    }
                    var isSearch;
                    if (newBody.query.hasOwnProperty('multi_match')) {
                        var bodyforsearch = {
                            "query": {
                                "filtered": {
                                    "query": {
                                        "multi_match": newBody.query.multi_match
                                    },
                                    "filter": {
                                        "range": {
                                            '@timestamp': {
                                                "gte": greaterThan,
                                                "lte": lessThan
                                            }
                                        }
                                    }
                                }
                            }
                        };
                        newBody = bodyforsearch;
                        isSearch = true;
                    }
                    else {
                        newBody.query.filtered.filter.bool.must[0].range["@timestamp"] = {
                            "gte": greaterThan,
                            "lte": lessThan
                        };
                        oldRequestGreaterThan = JSON.parse(this.currentRequest.body).query.filtered.filter.bool.must[0].range["@timestamp"].gte;
                    }
                    var loadMoreObservable = Observable_1.Observable.create(function (observer) {
                        if (!(oldRequestGreaterThan === greaterThan)) {
                            _this.currentRequest.body = JSON.stringify(newBody);
                            var observableAux = Observable_1.Observable.create(function (observeraux) { return _this.listAllLogs(_this.currentRequest, observeraux); });
                            observableAux.subscribe(function (logs) {
                                observer.next(logs);
                            });
                            if (isSearch) {
                                observer.complete();
                            }
                        }
                        else {
                            console.log("No more results to fetch");
                            observer.complete();
                        }
                    });
                    return loadMoreObservable;
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