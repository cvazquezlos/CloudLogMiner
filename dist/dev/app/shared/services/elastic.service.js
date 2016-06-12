"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var http_1 = require('@angular/http');
require('rxjs/add/operator/map');
var Observable_1 = require("rxjs/Observable");
var ES_URL = 'http://127.0.0.1:9200/';
var INDEX = "<logstash-*>";
var ElasticService = (function () {
    function ElasticService(_http) {
        this._http = _http;
        this.scroll = "";
        this.fields = {
            level: "",
            logger: "",
            thread: ""
        };
        this.sizeOfPage = 10;
        this.nResults = 0;
        this.maxResults = 50;
        this.state = { filesFilter: "", dateFilter: "" };
    }
    ElasticService.prototype.listIndices = function () {
        return this._http.get('http://localhost:9200/_stats/index,store')
            .map(function (res) { return res.json(); })
            .map(function (res) {
            return Object.getOwnPropertyNames(res.indices);
        });
    };
    ElasticService.prototype.requestWithState = function (requestOptions, emitter) {
        var actualbody = JSON.parse(requestOptions.body);
        var dateFilterHappenedBefore = false;
        var fileFilterHappenedBefore = false;
        if (this.state.filesFilter || this.state.dateFilter) {
            var itHappenedBefore = false;
            if (actualbody.query.bool) {
                var i = 0;
                for (var _i = 0, _a = actualbody.query.bool.must; _i < _a.length; _i++) {
                    var musts = _a[_i];
                    if (musts.range && this.state.dateFilter) {
                        actualbody.query.bool.must[i].range = this.state.dateFilter.range;
                        dateFilterHappenedBefore = true;
                    }
                    else if (musts['query_string'] && this.state.filesFilter) {
                        actualbody.query.bool.must[i]['query_string'] = this.state.filesFilter['query_string'];
                        fileFilterHappenedBefore = true;
                    }
                    i++;
                }
            }
            if (this.state.dateFilter && !dateFilterHappenedBefore) {
                var futuremust = void 0;
                if (actualbody.query.bool && actualbody.query.bool.must) {
                    futuremust = actualbody.query.bool.must;
                    futuremust.push(this.state.dateFilter);
                }
                else {
                    futuremust = [actualbody.query, this.state.dateFilter];
                }
                actualbody.query = {
                    bool: {
                        must: futuremust
                    }
                };
            }
            else if (this.state.filesFilter && !fileFilterHappenedBefore) {
                var futuremust = void 0;
                if (actualbody.query.bool && actualbody.query.bool.must) {
                    futuremust = actualbody.query.bool.must;
                    futuremust.push(this.state.filesFilter);
                }
                else {
                    futuremust = [actualbody.query, this.state.filesFilter];
                }
                actualbody.query = {
                    bool: {
                        must: futuremust
                    }
                };
            }
            requestOptions.body = JSON.stringify(actualbody);
        }
        this.listAllLogs(requestOptions, emitter);
    };
    ElasticService.prototype.listAllLogs = function (requestOptions, emitter) {
        var _this = this;
        this._http.request(new http_1.Request(requestOptions))
            .map(function (responseData) { return responseData.json(); })
            .map(function (answer) {
            var id = answer._scroll_id;
            _this.scroll = id;
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
                var requestOptions2 = _this.wrapRequestOptions(url2, body2);
                _this.listAllLogs(requestOptions2, emitter);
                return;
            }
            else {
                _this.nResults = 0;
                emitter.complete();
            }
        }, function (err) {
            if (err.status === 200) {
                emitter.error(new Error("Can't access elasticSearch instance (ERR_CONNECTION_REFUSED)"));
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
                bool: {
                    must: [
                        { range: {
                                '@timestamp': {
                                    gte: "now-200d",
                                    lte: "now" }
                            }
                        },
                        {
                            filtered: {
                                filter: {
                                    bool: {
                                        must: [
                                            {
                                                "bool": {
                                                    "should": [
                                                        { "exists": { "field": "thread_name" } },
                                                        { "exists": { "field": "threadid" } }
                                                    ]
                                                }
                                            },
                                            {
                                                "bool": {
                                                    "should": [
                                                        { "exists": { "field": "logger_name" } },
                                                        { "exists": { "field": "loggername" } }
                                                    ]
                                                }
                                            },
                                            {
                                                "bool": {
                                                    "should": [
                                                        { "exists": { "field": "loglevel" } },
                                                        { "exists": { "field": "level" } }
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            size: this.sizeOfPage
        };
        var requestOptions = this.wrapRequestOptions(url, body);
        this.currentRequest = requestOptions;
        var observable = Observable_1.Observable.create(function (observer) { return _this.requestWithState(requestOptions, observer); });
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
                    "fields": ["type", "host", "message", this.fields.level, this.fields.logger, this.fields.thread, "path"],
                    "tie_breaker": 0.3,
                    "minimum_should_match": "30%"
                }
            },
            size: this.sizeOfPage,
            sort: sort
        };
        var url = ES_URL + INDEX + '/_search?scroll=1m';
        var requestOptions2 = this.wrapRequestOptions(url, body);
        if (!orderByRelevance) {
            this.currentRequest = requestOptions2;
        }
        else {
            this.currentRequest = null;
        }
        var observable = Observable_1.Observable.create(function (observer) {
            return _this.requestWithState(requestOptions2, observer);
        });
        return observable;
    };
    ElasticService.prototype.loadMore = function (lastLog, loadLater) {
        if (this.currentRequest) {
            var logTime = lastLog.time || lastLog._source["@timestamp"];
            var lessThan = void 0, greaterThan = void 0;
            if (loadLater) {
                lessThan = logTime;
                greaterThan = logTime + "||-200d";
            }
            else {
                lessThan = logTime + "||+200d";
                greaterThan = logTime;
            }
            return this.loadByDate(lessThan, greaterThan);
        }
        else {
            return Observable_1.Observable.create(function (ob) { ob.complete(); });
        }
    };
    ElasticService.prototype.loadByDate = function (lessThan, greaterThan) {
        var _this = this;
        var oldRequestGreaterThan;
        var notSupported = false;
        var newBody;
        if (this.currentRequest) {
            newBody = JSON.parse(this.currentRequest.body);
            var i = 0;
            var addition = {
                range: {
                    "@timestamp": {
                        "gte": greaterThan,
                        "lte": lessThan
                    }
                }
            };
            this.state.dateFilter = addition;
            var itHappenedBefore = false;
            if (newBody.query.bool) {
                var i_1 = 0;
                for (var _i = 0, _a = newBody.query.bool.must; _i < _a.length; _i++) {
                    var musts = _a[_i];
                    if (musts.range) {
                        newBody.query.bool.must[i_1].range = addition.range;
                        itHappenedBefore = true;
                        break;
                    }
                    i_1++;
                }
            }
            if (!itHappenedBefore) {
                var futuremust = void 0;
                if (newBody.query.bool.must) {
                    futuremust = newBody.query.bool.must;
                    futuremust.push(addition);
                }
                else {
                    futuremust = [newBody.query, addition];
                }
                newBody.query = {
                    bool: {
                        must: futuremust
                    }
                };
            }
        }
        else {
            notSupported = true;
        }
        var loadMoreObservable = Observable_1.Observable.create(function (observer) {
            if (!notSupported) {
                _this.currentRequest.body = JSON.stringify(newBody);
                var observableAux = Observable_1.Observable.create(function (observeraux) { return _this.requestWithState(_this.currentRequest, observeraux); });
                observableAux.subscribe(function (logs) {
                    observer.next(logs);
                }, function (err) { return console.log(err); }, function () { observer.complete(); });
            }
            else {
                observer.error(new Error("Request not supported. Reason: request to be ordered by relevance"));
            }
        });
        return loadMoreObservable;
    };
    ElasticService.prototype.loadByFile = function (file) {
        var _this = this;
        var newBody = JSON.parse(this.currentRequest.body);
        var addition = {
            "query_string": {
                "default_field": "path",
                "query": "*" + file + "*"
            }
        };
        var itHappenedBefore = false;
        if (newBody.query.bool) {
            var i = 0;
            for (var _i = 0, _a = newBody.query.bool.must; _i < _a.length; _i++) {
                var musts = _a[_i];
                if (musts['query_string']) {
                    newBody.query.bool.must[i]['query_string'] = addition['query_string'];
                    itHappenedBefore = true;
                    break;
                }
                i++;
            }
        }
        if (!itHappenedBefore) {
            var futuremust = void 0;
            if (newBody.query.bool.must) {
                futuremust = newBody.query.bool.must;
                futuremust.push(addition);
            }
            else {
                futuremust = [newBody.query, addition];
            }
            newBody.query = {
                bool: {
                    must: futuremust
                }
            };
        }
        this.state.filesFilter = addition;
        var url = ES_URL + INDEX + '/_search?scroll=1m&filter_path=_scroll_id,hits.hits._source,hits.hits._type';
        var requestOptions = this.wrapRequestOptions(url, newBody);
        var observable = Observable_1.Observable.create(function (observer) {
            return _this.requestWithState(requestOptions, observer);
        });
        return observable;
    };
    ElasticService.prototype.wrapRequestOptions = function (url, body) {
        return new http_1.RequestOptions({
            method: http_1.RequestMethod.Post,
            url: url,
            body: JSON.stringify(body)
        });
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
        var path = logEntry._source.path;
        var logValue = { type: type, time: time, message: message, level: level, thread: thread, logger: logger, host: host, path: path };
        return logValue;
    };
    ElasticService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [http_1.Http])
    ], ElasticService);
    return ElasticService;
}());
exports.ElasticService = ElasticService;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9zaGFyZWQvc2VydmljZXMvZWxhc3RpYy5zZXJ2aWNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFLQSxxQkFBc0MsZUFBZSxDQUFDLENBQUE7QUFDdEQscUJBQTJELGVBQWUsQ0FBQyxDQUFBO0FBQzNFLFFBQU8sdUJBQXVCLENBQUMsQ0FBQTtBQUMvQiwyQkFBeUIsaUJBQWlCLENBQUMsQ0FBQTtBQUcxQyxJQUFNLE1BQU0sR0FBRyx3QkFBd0IsQ0FBQztBQUN4QyxJQUFNLEtBQUssR0FBRyxjQUFjLENBQUM7QUFPOUI7SUEyQkksd0JBQW9CLEtBQVc7UUFBWCxVQUFLLEdBQUwsS0FBSyxDQUFNO1FBeEIvQixXQUFNLEdBQVUsRUFBRSxDQUFDO1FBRW5CLFdBQU0sR0FJSjtZQUNFLEtBQUssRUFBQyxFQUFFO1lBQ1IsTUFBTSxFQUFDLEVBQUU7WUFDVCxNQUFNLEVBQUMsRUFBRTtTQUNaLENBQUM7UUFFTSxlQUFVLEdBQVUsRUFBRSxDQUFDO1FBRXZCLGFBQVEsR0FBVSxDQUFDLENBQUM7UUFFcEIsZUFBVSxHQUFVLEVBQUUsQ0FBQztRQUl2QixVQUFLLEdBQXdDLEVBQUMsV0FBVyxFQUFDLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFDLENBQUM7SUFNdEYsQ0FBQztJQUVNLG9DQUFXLEdBQWxCO1FBQ0ksTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLDBDQUEwQyxDQUFDO2FBQzVELEdBQUcsQ0FBQyxVQUFBLEdBQUcsSUFBRSxPQUFBLEdBQUcsQ0FBQyxJQUFJLEVBQUUsRUFBVixDQUFVLENBQUM7YUFDcEIsR0FBRyxDQUFDLFVBQUEsR0FBRztZQUNKLE1BQU0sQ0FBQyxNQUFNLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQ25ELENBQUMsQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUVNLHlDQUFnQixHQUF2QixVQUF3QixjQUFrQixFQUFFLE9BQU87UUFF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S0FBSyxFQUFFLFFBQUEsTUFBTSxFQUFFLFFBQUEsTUFBTSxFQUFFLE1BQUEsSUFBSSxFQUFFLE1BQUEsSUFBSSxFQUFDLENBQUM7UUFFeEUsTUFBTSxDQUFDLFFBQVEsQ0FBQztJQUNwQixDQUFDO0lBOVpMO1FBQUMsaUJBQVUsRUFBRTs7c0JBQUE7SUErWmIscUJBQUM7QUFBRCxDQTlaQSxBQThaQyxJQUFBO0FBOVpZLHNCQUFjLGlCQThaMUIsQ0FBQSIsImZpbGUiOiJhcHAvc2hhcmVkL3NlcnZpY2VzL2VsYXN0aWMuc2VydmljZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSBzaWx2aWEgb24gMjYvMi8xNi5cbiAqL1xuXG4vL1JlbW92ZWQgbWFwLmQgaW1wb3J0IGFzIG5vIG5lY2Vzc2FyeVxuaW1wb3J0IHtJbmplY3RhYmxlLEV2ZW50RW1pdHRlcn0gZnJvbSBcIkBhbmd1bGFyL2NvcmVcIjtcbmltcG9ydCB7SHR0cCwgUmVxdWVzdE9wdGlvbnMsIFJlcXVlc3RNZXRob2QsIFJlcXVlc3R9IGZyb20gJ0Bhbmd1bGFyL2h0dHAnO1xuaW1wb3J0ICdyeGpzL2FkZC9vcGVyYXRvci9tYXAnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tIFwicnhqcy9PYnNlcnZhYmxlXCI7XG5cblxuIGNvbnN0IEVTX1VSTCA9ICdodHRwOi8vMTI3LjAuMC4xOjkyMDAvJztcbiBjb25zdCBJTkRFWCA9IFwiPGxvZ3N0YXNoLSo+XCI7XG4vKlxuY29uc3QgRVNfVVJMID0gJ2h0dHA6Ly9qZW5raW5zOmplbmtpbnMxMzBAZWxhc3RpY3NlYXJjaC5rdXJlbnRvLm9yZzo5MjAwLyc7XG5jb25zdCBJTkRFWCA9IFwiPGt1cmVudG8tKj5cIjsqL1xuXG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBFbGFzdGljU2VydmljZSB7XG5cblxuICAgIHNjcm9sbDpzdHJpbmcgPSBcIlwiOyAgICAgICAgIC8vRWxhc3RpY3NlYXJjaCBzY3JvbGwgaW5kaWNhdG9yXG5cbiAgICBmaWVsZHM6e1xuICAgICAgICBsZXZlbDphbnksXG4gICAgICAgIGxvZ2dlcjphbnksXG4gICAgICAgIHRocmVhZDphbnlcbiAgICB9PXtcbiAgICAgICAgbGV2ZWw6XCJcIixcbiAgICAgICAgbG9nZ2VyOlwiXCIsXG4gICAgICAgIHRocmVhZDpcIlwiXG4gICAgfTtcblxuICAgIHByaXZhdGUgc2l6ZU9mUGFnZTpudW1iZXIgPSAxMDtcblxuICAgIHByaXZhdGUgblJlc3VsdHM6bnVtYmVyID0gMDtcblxuICAgIHByaXZhdGUgbWF4UmVzdWx0czpudW1iZXIgPSA1MDtcblxuICAgIHByaXZhdGUgY3VycmVudFJlcXVlc3Q6UmVxdWVzdE9wdGlvbnM7XG5cbiAgICBwcml2YXRlIHN0YXRlOiB7ZmlsZXNGaWx0ZXI6IGFueSwgZGF0ZUZpbHRlcjogYW55fSA9IHtmaWxlc0ZpbHRlcjpcIlwiLCBkYXRlRmlsdGVyOiBcIlwifTtcblxuXG5cbiAgICBjb25zdHJ1Y3Rvcihwcml2YXRlIF9odHRwOiBIdHRwKSB7XG5cbiAgICB9XG5cbiAgICBwdWJsaWMgbGlzdEluZGljZXMoKSB7ICAgICAgICAgICAgICAgICAgICAgLy9OZXZlciB1c2VkXG4gICAgICAgIHJldHVybiB0aGlzLl9odHRwLmdldCgnaHR0cDovL2xvY2FsaG9zdDo5MjAwL19zdGF0cy9pbmRleCxzdG9yZScpXG4gICAgICAgICAgICAubWFwKHJlcz0+cmVzLmpzb24oKSlcbiAgICAgICAgICAgIC5tYXAocmVzID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMocmVzLmluZGljZXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlcXVlc3RXaXRoU3RhdGUocmVxdWVzdE9wdGlvbnM6YW55LCBlbWl0dGVyKSB7XG4gICAgICAvL0NoZWNrIHN0YXRlXG4gICAgICAgIGxldCBhY3R1YWxib2R5ID0gSlNPTi5wYXJzZShyZXF1ZXN0T3B0aW9ucy5ib2R5KTtcbiAgICAgICAgbGV0IGRhdGVGaWx0ZXJIYXBwZW5lZEJlZm9yZSA9IGZhbHNlO1xuICAgICAgICBsZXQgZmlsZUZpbHRlckhhcHBlbmVkQmVmb3JlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKHRoaXMuc3RhdGUuZmlsZXNGaWx0ZXIgfHwgdGhpcy5zdGF0ZS5kYXRlRmlsdGVyKSB7XG4gICAgICAgICAgICBsZXQgaXRIYXBwZW5lZEJlZm9yZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChhY3R1YWxib2R5LnF1ZXJ5LmJvb2wpIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IGkgPSAwO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGxldCBtdXN0cyBvZiBhY3R1YWxib2R5LnF1ZXJ5LmJvb2wubXVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG11c3RzLnJhbmdlICYmIHRoaXMuc3RhdGUuZGF0ZUZpbHRlcikgeyAgICAgICAgICAgICAvL2NoZWNrIGlmIGxvYWRCeURhdGUgaGFzIGFscmVhZHkgaGFwcGVuZWQgaW4gY3VycmVudCByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGFjdHVhbGJvZHkucXVlcnkuYm9vbC5tdXN0W2ldLnJhbmdlID0gdGhpcy5zdGF0ZS5kYXRlRmlsdGVyLnJhbmdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRlRmlsdGVySGFwcGVuZWRCZWZvcmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtdXN0c1sncXVlcnlfc3RyaW5nJ10gJiYgdGhpcy5zdGF0ZS5maWxlc0ZpbHRlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICBhY3R1YWxib2R5LnF1ZXJ5LmJvb2wubXVzdFtpXVsncXVlcnlfc3RyaW5nJ10gPSB0aGlzLnN0YXRlLmZpbGVzRmlsdGVyWydxdWVyeV9zdHJpbmcnXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZmlsZUZpbHRlckhhcHBlbmVkQmVmb3JlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGkrKztcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhdGUuZGF0ZUZpbHRlciAmJiAhZGF0ZUZpbHRlckhhcHBlbmVkQmVmb3JlKSB7XG4gICAgICAgICAgICAgICAgICAgIGxldCBmdXR1cmVtdXN0O1xuICAgICAgICAgICAgICAgICAgICBpZihhY3R1YWxib2R5LnF1ZXJ5LmJvb2wgJiYgYWN0dWFsYm9keS5xdWVyeS5ib29sLm11c3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1dHVyZW11c3QgPSBhY3R1YWxib2R5LnF1ZXJ5LmJvb2wubXVzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZ1dHVyZW11c3QucHVzaCh0aGlzLnN0YXRlLmRhdGVGaWx0ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnV0dXJlbXVzdCA9IFthY3R1YWxib2R5LnF1ZXJ5LCB0aGlzLnN0YXRlLmRhdGVGaWx0ZXJdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGFjdHVhbGJvZHkucXVlcnkgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBib29sOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIG11c3Q6XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGZ1dHVyZW11c3RcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc3RhdGUuZmlsZXNGaWx0ZXIgJiYgIWZpbGVGaWx0ZXJIYXBwZW5lZEJlZm9yZSkge1xuICAgICAgICAgICAgICAgICAgICBsZXQgZnV0dXJlbXVzdDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdHVhbGJvZHkucXVlcnkuYm9vbCAmJiBhY3R1YWxib2R5LnF1ZXJ5LmJvb2wubXVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgIGZ1dHVyZW11c3QgPSBhY3R1YWxib2R5LnF1ZXJ5LmJvb2wubXVzdDtcbiAgICAgICAgICAgICAgICAgICAgICBmdXR1cmVtdXN0LnB1c2godGhpcy5zdGF0ZS5maWxlc0ZpbHRlcik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgZnV0dXJlbXVzdCA9IFthY3R1YWxib2R5LnF1ZXJ5LCB0aGlzLnN0YXRlLmZpbGVzRmlsdGVyXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBhY3R1YWxib2R5LnF1ZXJ5ID0ge1xuICAgICAgICAgICAgICAgICAgICAgIGJvb2w6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG11c3Q6IGZ1dHVyZW11c3RcbiAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMuYm9keSA9IEpTT04uc3RyaW5naWZ5KGFjdHVhbGJvZHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5saXN0QWxsTG9ncyhyZXF1ZXN0T3B0aW9ucywgZW1pdHRlcik7XG4gICAgfVxuXG4gICAgcHVibGljIGxpc3RBbGxMb2dzKHJlcXVlc3RPcHRpb25zOmFueSwgZW1pdHRlcik6IHZvaWQge1xuXG4gICAgICAgIHRoaXMuX2h0dHAucmVxdWVzdChuZXcgUmVxdWVzdChyZXF1ZXN0T3B0aW9ucykpXG4gICAgICAgICAgICAubWFwKChyZXNwb25zZURhdGEpPT4geyByZXR1cm4gcmVzcG9uc2VEYXRhLmpzb24oKX0pICAgICAgICAvL0ltcG9ydGFudCBpbmNsdWRlICdyZXR1cm4nIGtleXdvcmRcbiAgICAgICAgICAgIC5tYXAoKGFuc3dlcik9PiB7XG4gICAgICAgICAgICAgICAgbGV0IGlkID0gYW5zd2VyLl9zY3JvbGxfaWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5zY3JvbGwgPSBpZDsgICAgICAgICAgICAgICAgLy9pZCBoYXMgdG8gYmUgYXNzaWduZWQgYmVmb3JlIG1hcExvZ3MsIHdoaWNoIG9ubHkgcmV0dXJucyB0aGUgaGl0cy5cbiAgICAgICAgICAgICAgICBhbnN3ZXI9dGhpcy5tYXBMb2dzKGFuc3dlcik7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFuc3dlcjtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuc3Vic2NyaWJlKGJhdGNoPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMublJlc3VsdHM9dGhpcy5uUmVzdWx0cyt0aGlzLnNpemVPZlBhZ2U7XG4gICAgICAgICAgICAgICAgZW1pdHRlci5uZXh0KGJhdGNoKTtcbiAgICAgICAgICAgICAgICBpZih0aGlzLm5SZXN1bHRzPHRoaXMubWF4UmVzdWx0cyAmJiBiYXRjaC5sZW5ndGg9PXRoaXMuc2l6ZU9mUGFnZSl7ICAgICAgICAgLy9pZiBsZW5ndGggaXMgbGVzcyB0aGFuIHNpemUgb2YgcGFnZSB0aGVyZSBpcyBubyBuZWVkIGZvciBhIHNjcm9sbFxuICAgICAgICAgICAgICAgICAgICBsZXQgYm9keTIgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcInNjcm9sbFwiIDogXCIxbVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzY3JvbGxfaWRcIiA6IHRoaXMuc2Nyb2xsXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIGxldCB1cmwyID0gRVNfVVJMICsgJ19zZWFyY2gvc2Nyb2xsJztcbiAgICAgICAgICAgICAgICAgICAgbGV0IHJlcXVlc3RPcHRpb25zMiA9IHRoaXMud3JhcFJlcXVlc3RPcHRpb25zKHVybDIsIGJvZHkyKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5saXN0QWxsTG9ncyhyZXF1ZXN0T3B0aW9uczIsIGVtaXR0ZXIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfWVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm5SZXN1bHRzPTA7XG4gICAgICAgICAgICAgICAgICAgIGVtaXR0ZXIuY29tcGxldGUoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0sIGVyciA9PiB7IGlmKGVyci5zdGF0dXM9PT0yMDApe1xuICAgICAgICAgICAgICAgICAgICBlbWl0dGVyLmVycm9yKG5ldyBFcnJvcihcIkNhbid0IGFjY2VzcyBlbGFzdGljU2VhcmNoIGluc3RhbmNlIChFUlJfQ09OTkVDVElPTl9SRUZVU0VEKVwiKSlcbiAgICAgICAgICAgICAgICB9IH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRSb3dzRGVmYXVsdCgpIHsgICAgICAgICAgICAvL05PVEUgU0NST0xMIElEISBFbGFzdGljc2VhcmNoIHNjcm9sbCB3b3VsZG4ndCB3b3JrIHdpdGhvdXQgaXRcbiAgICAgICAgbGV0IHVybCA9RVNfVVJMICsgSU5ERVggKyAnL19zZWFyY2g/c2Nyb2xsPTFtJmZpbHRlcl9wYXRoPV9zY3JvbGxfaWQsaGl0cy5oaXRzLl9zb3VyY2UsaGl0cy5oaXRzLl90eXBlJztcbiAgICAgICAgbGV0IGJvZHk9IHtcbiAgICAgICAgc29ydDogW1xuICAgICAgICAgICAgICAgIHsgXCJAdGltZXN0YW1wXCI6IFwiZGVzY1wiIH1cbiAgICAgICAgICAgIF0sXG4gICAgICAgICAgICBxdWVyeToge1xuICAgICAgICAgICAgICAgIGJvb2w6IHtcbiAgICAgICAgICAgICAgICAgICAgbXVzdDogW1xuICAgICAgICAgICAgICAgICAgICAgICAge3JhbmdlOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0B0aW1lc3RhbXAnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGd0ZTogXCJub3ctMjAwZFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsdGU6IFwibm93XCIgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXJlZDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmaWx0ZXI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJvb2w6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtdXN0OiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYm9vbFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzaG91bGRcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XCJleGlzdHNcIjoge1wiZmllbGRcIjogXCJ0aHJlYWRfbmFtZVwifX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcImV4aXN0c1wiOiB7XCJmaWVsZFwiOiBcInRocmVhZGlkXCJ9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJib29sXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcInNob3VsZFwiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcImV4aXN0c1wiOiB7XCJmaWVsZFwiOiBcImxvZ2dlcl9uYW1lXCJ9fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1wiZXhpc3RzXCI6IHtcImZpZWxkXCI6IFwibG9nZ2VybmFtZVwifX1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFwiYm9vbFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzaG91bGRcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XCJleGlzdHNcIjoge1wiZmllbGRcIjogXCJsb2dsZXZlbFwifX0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHtcImV4aXN0c1wiOiB7XCJmaWVsZFwiOiBcImxldmVsXCJ9fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzaXplOiB0aGlzLnNpemVPZlBhZ2VcbiAgICAgICAgICAgIC8vVGhlIGZvbGxvd2luZyBhcmUgdGhlIGZpZWxkcyB0aGF0IGFyZSByZXF1ZXN0ZWQgZnJvbSBlYWNoIGxvZy4gVGhleSBzaG91bGQgYmUgY29uc2lzdGVudCB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIGxvZ1ZhbHVlXG4gICAgICAgICAgICAvL19zb3VyY2U6IFtcImhvc3RcIiwgXCJ0aHJlYWRfbmFtZVwiLCBcImxvZ2dlcl9uYW1lXCIsIFwibWVzc2FnZVwiLCBcImxldmVsXCIsIFwiQHRpbWVzdGFtcFwiXeKAqFxuICAgICAgICB9O1xuICAgICAgICBsZXQgcmVxdWVzdE9wdGlvbnMgPSB0aGlzLndyYXBSZXF1ZXN0T3B0aW9ucyh1cmwsYm9keSk7XG4gICAgICAgIHRoaXMuY3VycmVudFJlcXVlc3QgPSByZXF1ZXN0T3B0aW9ucztcblxuICAgICAgICBsZXQgb2JzZXJ2YWJsZSA9IE9ic2VydmFibGUuY3JlYXRlKChvYnNlcnZlcikgPT4gdGhpcy5yZXF1ZXN0V2l0aFN0YXRlKHJlcXVlc3RPcHRpb25zLCBvYnNlcnZlcikpO1xuXG4gICAgICAgIHJldHVybiBvYnNlcnZhYmxlO1xuICAgIH1cblxuXG4gICAgcHVibGljIHNlYXJjaCh2YWx1ZTpzdHJpbmcsIG9yZGVyQnlSZWxldmFuY2U6IGJvb2xlYW4pIHtcbiAgICAgICAgbGV0IHNvcnQ7XG4gICAgICAgIGlmKG9yZGVyQnlSZWxldmFuY2UpIHtcbiAgICAgICAgICAgIGxldCBvcHRpb25zMSA9IFwiX3Njb3JlXCI7XG4gICAgICAgICAgICBzb3J0ID0gW29wdGlvbnMxXVxuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgICBsZXQgb3B0aW9uczIgPSB7ICdAdGltZXN0YW1wJzogJ2Rlc2MnfTtcbiAgICAgICAgICAgIHNvcnQgPSBbb3B0aW9uczJdO1xuICAgICAgICB9XG4gICAgICAgIGxldCBib2R5ID0ge1xuICAgICAgICAgICAgXCJxdWVyeVwiOntcbiAgICAgICAgICAgICAgICBcIm11bHRpX21hdGNoXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgXCJxdWVyeVwiOnZhbHVlLFxuICAgICAgICAgICAgICAgICAgICBcInR5cGVcIjpcImJlc3RfZmllbGRzXCIsXG4gICAgICAgICAgICAgICAgICAgIFwiZmllbGRzXCI6IFtcInR5cGVcIiwgXCJob3N0XCIsIFwibWVzc2FnZVwiLCB0aGlzLmZpZWxkcy5sZXZlbCwgdGhpcy5maWVsZHMubG9nZ2VyLCB0aGlzLmZpZWxkcy50aHJlYWQsIFwicGF0aFwiXSwgICAgICAgICAvL05vdCBmaWx0ZXIgYnkgdGltZTogcGFyc2luZyB1c2VyIGlucHV0IHdvdWxkIGJlIHJlcXVpcmVkXG4gICAgICAgICAgICAgICAgICAgIFwidGllX2JyZWFrZXJcIjowLjMsXG4gICAgICAgICAgICAgICAgICAgIFwibWluaW11bV9zaG91bGRfbWF0Y2hcIjpcIjMwJVwiXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNpemU6dGhpcy5zaXplT2ZQYWdlLFxuICAgICAgICAgICAgc29ydDpcbiAgICAgICAgICAgICAgICBzb3J0XG5cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IHVybCA9IEVTX1VSTCArIElOREVYICsgJy9fc2VhcmNoP3Njcm9sbD0xbSc7XG5cbiAgICAgICAgbGV0IHJlcXVlc3RPcHRpb25zMiA9IHRoaXMud3JhcFJlcXVlc3RPcHRpb25zKHVybCxib2R5KTtcbiAgICAgICAgaWYgKCFvcmRlckJ5UmVsZXZhbmNlKSB7ICAgICAgICAgICAgLy9GZXRjaGluZyBtb3JlIGFzIGl0IGlzIGltcGxlbWVudGVkIG5vdyB1c2VzIHRpbWVzdGFtcCBvZiB0aGUgb2xkZXIgbG9nXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRSZXF1ZXN0ID0gcmVxdWVzdE9wdGlvbnMyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5jdXJyZW50UmVxdWVzdCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG9ic2VydmFibGUgPSBPYnNlcnZhYmxlLmNyZWF0ZSgob2JzZXJ2ZXIpID0+XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RXaXRoU3RhdGUocmVxdWVzdE9wdGlvbnMyLCBvYnNlcnZlcikpO1xuXG4gICAgICAgIHJldHVybiBvYnNlcnZhYmxlO1xuICAgIH1cblxuXG4gICAgbG9hZE1vcmUobGFzdExvZzogYW55LCBsb2FkTGF0ZXI6IGJvb2xlYW4pe1xuICAgICAgICBpZih0aGlzLmN1cnJlbnRSZXF1ZXN0KSB7XG4gICAgICAgICAgICBsZXQgbG9nVGltZSA9IGxhc3RMb2cudGltZSB8fCBsYXN0TG9nLl9zb3VyY2VbXCJAdGltZXN0YW1wXCJdO1xuICAgICAgICAgIGxldCBsZXNzVGhhbiwgZ3JlYXRlclRoYW47XG4gICAgICAgICAgICBpZihsb2FkTGF0ZXIpIHtcbiAgICAgICAgICAgICAgbGVzc1RoYW4gPSBsb2dUaW1lO1xuICAgICAgICAgICAgICBncmVhdGVyVGhhbiA9IGxvZ1RpbWUrXCJ8fC0yMDBkXCI7IC8vXCJEYXRlIE1hdGggc3RhcnRzIHdpdGggYW4gYW5jaG9yIGRhdGUsIHdoaWNoIGNhbiBlaXRoZXIgYmUgbm93LCBvciBhIGRhdGUgc3RyaW5nIGVuZGluZyB3aXRoIHx8LiAoRWxhc3RpY1NlYXJjaClcIlxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbGVzc1RoYW4gPSBsb2dUaW1lK1wifHwrMjAwZFwiO1xuICAgICAgICAgICAgICBncmVhdGVyVGhhbiA9IGxvZ1RpbWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLmxvYWRCeURhdGUobGVzc1RoYW4sIGdyZWF0ZXJUaGFuKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIE9ic2VydmFibGUuY3JlYXRlKChvYikgPT4ge29iLmNvbXBsZXRlKCl9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGxvYWRCeURhdGUobGVzc1RoYW4sIGdyZWF0ZXJUaGFuKSB7XG4gICAgICAgIGxldCBvbGRSZXF1ZXN0R3JlYXRlclRoYW47XG4gICAgICAgIGxldCBub3RTdXBwb3J0ZWQgPSBmYWxzZTtcbiAgICAgICAgbGV0IG5ld0JvZHk7XG4gICAgICAgIGlmKHRoaXMuY3VycmVudFJlcXVlc3QpIHtcbiAgICAgICAgICAgIG5ld0JvZHkgPSBKU09OLnBhcnNlKHRoaXMuY3VycmVudFJlcXVlc3QuYm9keSk7XG4gICAgICAgICAgICBsZXQgaT0wO1xuICAgICAgICAgICAgbGV0IGFkZGl0aW9uID0ge1xuICAgICAgICAgICAgICAgIHJhbmdlOiB7XG4gICAgICAgICAgICAgICAgICAgIFwiQHRpbWVzdGFtcFwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBcImd0ZVwiOiBncmVhdGVyVGhhbixcbiAgICAgICAgICAgICAgICAgICAgICAgIFwibHRlXCI6IGxlc3NUaGFuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGhpcy5zdGF0ZS5kYXRlRmlsdGVyID0gYWRkaXRpb247XG5cbiAgICAgICAgICAgIGxldCBpdEhhcHBlbmVkQmVmb3JlID0gZmFsc2U7XG4gICAgICAgICAgICBpZihuZXdCb2R5LnF1ZXJ5LmJvb2wpIHtcbiAgICAgICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICAgICAgZm9yKGxldCBtdXN0cyBvZiBuZXdCb2R5LnF1ZXJ5LmJvb2wubXVzdCkge1xuICAgICAgICAgICAgICAgICAgICBpZihtdXN0cy5yYW5nZSkgeyAgICAgICAgICAgICAvL2NoZWNrIGlmIGxvYWRCeURhdGUgaGFzIGFscmVhZHkgaGFwcGVuZWQgaW4gY3VycmVudCByZXF1ZXN0XG4gICAgICAgICAgICAgICAgICAgICAgICBuZXdCb2R5LnF1ZXJ5LmJvb2wubXVzdFtpXS5yYW5nZSA9IGFkZGl0aW9uLnJhbmdlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaXRIYXBwZW5lZEJlZm9yZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoIWl0SGFwcGVuZWRCZWZvcmUpIHtcbiAgICAgICAgICAgICAgICBsZXQgZnV0dXJlbXVzdDtcbiAgICAgICAgICAgICAgICBpZihuZXdCb2R5LnF1ZXJ5LmJvb2wubXVzdCkge1xuICAgICAgICAgICAgICAgICAgICBmdXR1cmVtdXN0ID0gbmV3Qm9keS5xdWVyeS5ib29sLm11c3Q7XG4gICAgICAgICAgICAgICAgICAgIGZ1dHVyZW11c3QucHVzaChhZGRpdGlvbik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZnV0dXJlbXVzdCA9IFtuZXdCb2R5LnF1ZXJ5LCBhZGRpdGlvbl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG5ld0JvZHkucXVlcnkgPSB7XG4gICAgICAgICAgICAgICAgICAgIGJvb2w6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG11c3Q6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZnV0dXJlbXVzdFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHsgICAgLy9JdCBpcyBvcmRlcmVkIGJ5IHJlbGV2YW5jZVxuICAgICAgICAgICAgbm90U3VwcG9ydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBsb2FkTW9yZU9ic2VydmFibGUgPSBPYnNlcnZhYmxlLmNyZWF0ZSgob2JzZXJ2ZXIpID0+IHtcbiAgICAgICAgICAgIGlmICgvKiEob2xkUmVxdWVzdEdyZWF0ZXJUaGFuID09PSBncmVhdGVyVGhhbikgJiYgKi8hbm90U3VwcG9ydGVkKSB7ICAgICAvL0xhc3QgcmVxdWVzdCBhbmQgbGFzdCBsb2cgbWF0Y2guIEl0IG1lYW5zIHRoZXJlIGhhcyBiZWVuIGEgbG9hZCBtb3JlIHdpdGggdGhlIHNhbWUgcmVzdWx0OiBubyBtb3JlIHJlc3VsdHMgdG8gYmUgZmV0Y2hlZFxuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFJlcXVlc3QuYm9keSA9IEpTT04uc3RyaW5naWZ5KG5ld0JvZHkpO1xuICAgICAgICAgICAgICAgIGxldCBvYnNlcnZhYmxlQXV4ID0gT2JzZXJ2YWJsZS5jcmVhdGUoKG9ic2VydmVyYXV4KSA9PiB0aGlzLnJlcXVlc3RXaXRoU3RhdGUodGhpcy5jdXJyZW50UmVxdWVzdCwgb2JzZXJ2ZXJhdXgpKTtcbiAgICAgICAgICAgICAgICBvYnNlcnZhYmxlQXV4LnN1YnNjcmliZShsb2dzID0+IHtcbiAgICAgICAgICAgICAgICAgICAgb2JzZXJ2ZXIubmV4dChsb2dzKTtcbiAgICAgICAgICAgICAgICB9LCAoZXJyKT0+Y29uc29sZS5sb2coZXJyKSwgKCk9PntvYnNlcnZlci5jb21wbGV0ZSgpfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vSWYgbGFzdCBsb2cncyB0aW1lIChncmVhdGVyVGhhbikgaXMgdGhlIHNhbWUgYXMgdGhlIGxhc3QgcmVxdWVzdCwgaXQgbWVhbnMgdGhlcmUgd2VyZSBubyBtb3JlIHJlc3VsdHMgdG8gZmV0Y2hcbiAgICAgICAgICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgRXJyb3IoXCJSZXF1ZXN0IG5vdCBzdXBwb3J0ZWQuIFJlYXNvbjogcmVxdWVzdCB0byBiZSBvcmRlcmVkIGJ5IHJlbGV2YW5jZVwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gbG9hZE1vcmVPYnNlcnZhYmxlO1xuICAgIH1cblxuICAgIGxvYWRCeUZpbGUoZmlsZTpzdHJpbmcpIHtcbiAgICAgICAgbGV0IG5ld0JvZHkgPSBKU09OLnBhcnNlKHRoaXMuY3VycmVudFJlcXVlc3QuYm9keSk7XG4gICAgICAgIGxldCBhZGRpdGlvbiA9IHtcbiAgICAgICAgICAgIFwicXVlcnlfc3RyaW5nXCIgOiB7XG4gICAgICAgICAgICAgICAgXCJkZWZhdWx0X2ZpZWxkXCI6IFwicGF0aFwiLFxuICAgICAgICAgICAgICAgIFwicXVlcnlcIjogXCIqXCIgKyBmaWxlICsgXCIqXCJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgbGV0IGl0SGFwcGVuZWRCZWZvcmUgPSBmYWxzZTtcbiAgICAgICAgaWYobmV3Qm9keS5xdWVyeS5ib29sKSB7XG4gICAgICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgICAgICBmb3IobGV0IG11c3RzIG9mIG5ld0JvZHkucXVlcnkuYm9vbC5tdXN0KSB7XG4gICAgICAgICAgICAgICAgaWYobXVzdHNbJ3F1ZXJ5X3N0cmluZyddKSB7ICAgICAgICAgICAgIC8vY2hlY2sgaWYgbG9hZEJ5RGF0ZSBoYXMgYWxyZWFkeSBoYXBwZW5lZCBpbiBjdXJyZW50IHJlcXVlc3RcbiAgICAgICAgICAgICAgICAgICAgbmV3Qm9keS5xdWVyeS5ib29sLm11c3RbaV1bJ3F1ZXJ5X3N0cmluZyddID0gYWRkaXRpb25bJ3F1ZXJ5X3N0cmluZyddO1xuICAgICAgICAgICAgICAgICAgICBpdEhhcHBlbmVkQmVmb3JlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZighaXRIYXBwZW5lZEJlZm9yZSkge1xuICAgICAgICAgICAgbGV0IGZ1dHVyZW11c3Q7XG4gICAgICAgICAgICBpZihuZXdCb2R5LnF1ZXJ5LmJvb2wubXVzdCkge1xuICAgICAgICAgICAgICAgIGZ1dHVyZW11c3QgPSBuZXdCb2R5LnF1ZXJ5LmJvb2wubXVzdDtcbiAgICAgICAgICAgICAgICBmdXR1cmVtdXN0LnB1c2goYWRkaXRpb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBmdXR1cmVtdXN0ID0gW25ld0JvZHkucXVlcnksIGFkZGl0aW9uXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG5ld0JvZHkucXVlcnkgPSB7XG4gICAgICAgICAgICAgICAgYm9vbDoge1xuICAgICAgICAgICAgICAgICAgICBtdXN0OlxuICAgICAgICAgICAgICAgICAgICAgIGZ1dHVyZW11c3RcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZS5maWxlc0ZpbHRlciA9IGFkZGl0aW9uO1xuXG4gICAgICAgIGxldCB1cmwgPSBFU19VUkwgKyBJTkRFWCArICcvX3NlYXJjaD9zY3JvbGw9MW0mZmlsdGVyX3BhdGg9X3Njcm9sbF9pZCxoaXRzLmhpdHMuX3NvdXJjZSxoaXRzLmhpdHMuX3R5cGUnO1xuXG4gICAgICAgIGxldCByZXF1ZXN0T3B0aW9ucyA9IHRoaXMud3JhcFJlcXVlc3RPcHRpb25zKHVybCwgbmV3Qm9keSk7XG5cbiAgICAgICAgbGV0IG9ic2VydmFibGUgPSBPYnNlcnZhYmxlLmNyZWF0ZSgob2JzZXJ2ZXIpID0+XG4gICAgICAgICAgICB0aGlzLnJlcXVlc3RXaXRoU3RhdGUocmVxdWVzdE9wdGlvbnMsIG9ic2VydmVyKSk7XG5cbiAgICAgICAgcmV0dXJuIG9ic2VydmFibGU7XG4gICAgfVxuXG4gICAgd3JhcFJlcXVlc3RPcHRpb25zKHVybDpzdHJpbmcsIGJvZHk6YW55KSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVxdWVzdE9wdGlvbnMoe1xuICAgICAgICAgICAgbWV0aG9kOiBSZXF1ZXN0TWV0aG9kLlBvc3QsXG4gICAgICAgICAgICB1cmwsXG4gICAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShib2R5KVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBtYXBMb2dzKGFuc3dlcik6IGFueVtdIHtcbiAgICAgICAgbGV0IHJlc3VsdDogYW55W109W107XG4gICAgICAgIGlmKGFuc3dlcikge1xuICAgICAgICAgICAgZm9yKGxldCBhIG9mIGFuc3dlci5oaXRzLmhpdHMpe1xuICAgICAgICAgICAgICAgIGxldCBiPXRoaXMuZWxhc3RpY0xvZ1Byb2Nlc3NpbmcoYSk7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goYik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBlbGFzdGljTG9nUHJvY2Vzc2luZyhsb2dFbnRyeTogYW55KSB7XG4gICAgICAgIGxldCB0eXBlID0gbG9nRW50cnkuX3R5cGU7XG4gICAgICAgIGxldCB0aW1lID0gbG9nRW50cnkuX3NvdXJjZVsnQHRpbWVzdGFtcCddO1xuICAgICAgICBsZXQgbWVzc2FnZSA9IGxvZ0VudHJ5Ll9zb3VyY2UubWVzc2FnZTtcbiAgICAgICAgbGV0IGxldmVsID0gbG9nRW50cnkuX3NvdXJjZS5sZXZlbCB8fCBsb2dFbnRyeS5fc291cmNlLmxvZ2xldmVsO1xuICAgICAgICBpZihsb2dFbnRyeS5fc291cmNlLmxldmVsKXtcbiAgICAgICAgICAgIHRoaXMuZmllbGRzLmxldmVsPVwibGV2ZWxcIjtcbiAgICAgICAgfWVsc2V7XG4gICAgICAgICAgICB0aGlzLmZpZWxkcy5sZXZlbD1cImxvZ2xldmVsXCI7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHRocmVhZCA9IGxvZ0VudHJ5Ll9zb3VyY2UudGhyZWFkX25hbWUgfHwgbG9nRW50cnkuX3NvdXJjZS50aHJlYWRpZDtcbiAgICAgICAgaWYobG9nRW50cnkuX3NvdXJjZS50aHJlYWRfbmFtZSl7XG4gICAgICAgICAgICB0aGlzLmZpZWxkcy50aHJlYWQ9XCJ0aHJlYWRfbmFtZVwiO1xuICAgICAgICB9ZWxzZXtcbiAgICAgICAgICAgIHRoaXMuZmllbGRzLnRocmVhZD1cInRocmVhZGlkXCI7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGxvZ2dlciA9IGxvZ0VudHJ5Ll9zb3VyY2UubG9nZ2VyX25hbWUgfHwgbG9nRW50cnkuX3NvdXJjZS5sb2dnZXJuYW1lO1xuICAgICAgICBpZihsb2dFbnRyeS5fc291cmNlLmxvZ2dlcl9uYW1lKXtcbiAgICAgICAgICAgIHRoaXMuZmllbGRzLmxvZ2dlcj1cImxvZ2dlcl9uYW1lXCI7XG4gICAgICAgIH1lbHNle1xuICAgICAgICAgICAgdGhpcy5maWVsZHMubG9nZ2VyPVwibG9nZ2VybmFtZVwiO1xuICAgICAgICB9XG4gICAgICAgIGxldCBob3N0ID0gbG9nRW50cnkuX3NvdXJjZS5ob3N0O1xuXG4gICAgICAgIGxldCBwYXRoID0gbG9nRW50cnkuX3NvdXJjZS5wYXRoO1xuXG4gICAgICAgIGxldCBsb2dWYWx1ZSA9IHt0eXBlLCB0aW1lLCBtZXNzYWdlLCBsZXZlbCwgdGhyZWFkLCBsb2dnZXIsIGhvc3QsIHBhdGh9O1xuXG4gICAgICAgIHJldHVybiBsb2dWYWx1ZTtcbiAgICB9XG59XG4iXX0=
