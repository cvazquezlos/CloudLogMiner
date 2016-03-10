var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('angular2/core');
var main_1 = require('ag-grid-ng2/main');
var http_1 = require('angular2/http');
var ES_URL = 'http://127.0.0.1:9200/';
var INDEX = "<logstash-*>";
var AppComponent = (function () {
    function AppComponent(http) {
        this.http = http;
        this.gridOptions = {};
        this.rowData = [];
        this.createRowData();
        this.createColumnDefs();
        this.showGrid = true;
    }
    AppComponent.prototype.createRowData = function () {
        var _this = this;
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
                                {
                                    "range": {
                                        "@timestamp": {
                                            "gte": "now-20d",
                                            "lte": "now"
                                        }
                                    }
                                },
                                { "bool": { "should": [
                                            {
                                                "exists": { "field": "thread_name" }
                                            },
                                            {
                                                "exists": { "field": "threadid" }
                                            }
                                        ]
                                    }
                                },
                                { "bool": { "should": [
                                            {
                                                "exists": { "field": "logger_name" }
                                            },
                                            {
                                                "exists": { "field": "loggername" }
                                            }
                                        ]
                                    }
                                },
                                { "bool": { "should": [
                                            {
                                                "exists": { "field": "loglevel" }
                                            },
                                            {
                                                "exists": { "field": "level" }
                                            }
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
        this.http.request(new http_1.Request(requestoptions))
            .subscribe(function (res) {
            var data = res.json();
            for (var _i = 0, _a = data.hits.hits; _i < _a.length; _i++) {
                var logEntry = _a[_i];
                var fullmessage = logEntry._source.message.replace('\n', '');
                var type = logEntry._type;
                var time = logEntry._source['@timestamp'];
                var message = logEntry._source.message;
                var level = logEntry._source.level || logEntry._source.loglevel;
                var thread = logEntry._source.thread_name || logEntry._source.threadid;
                var logger = logEntry._source.logger_name || logEntry._source.loggername;
                var host = logEntry._source.host;
                var logValue = { type: type, time: time, message: message, level: level, thread: thread, logger: logger, host: host };
                _this.rowData.push(logValue);
                _this.rowData = _this.rowData.slice();
            }
        });
    };
    AppComponent.prototype.createColumnDefs = function () {
        var rowColor = function (params) {
            if (params.data.level === 'ERROR') {
                return 'log-level-error';
            }
            else if (params.data.level === 'WARN') {
                return 'log-level-warn';
            }
            else {
                return '';
            }
        };
        this.columnDefs = [
            {
                headerName: '#', width: 30, checkboxSelection: false, suppressSorting: true,
                suppressMenu: true, pinned: true
            },
            {
                headerName: 'Time', width: 200, checkboxSelection: false, suppressSorting: true, field: "time",
                suppressMenu: true, pinned: false
            },
            {
                headerName: 'L', width: 60, checkboxSelection: false, suppressSorting: true, field: "level",
                suppressMenu: true, pinned: false, cellClass: rowColor
            },
            {
                headerName: 'Type', width: 60, checkboxSelection: false, suppressSorting: true, field: "type",
                suppressMenu: true, pinned: false
            },
            {
                headerName: 'Thread', width: 170, checkboxSelection: false, suppressSorting: true, field: "thread",
                suppressMenu: true, pinned: false
            },
            {
                headerName: 'Message', width: 600, checkboxSelection: false, suppressSorting: true, field: "message",
                suppressMenu: true, pinned: false
            },
            {
                headerName: 'Logger', width: 300, checkboxSelection: false, suppressSorting: true, field: "logger",
                suppressMenu: true, pinned: false
            },
            {
                headerName: 'Host', width: 300, checkboxSelection: false, suppressSorting: true, field: "host",
                suppressMenu: true, pinned: false
            }
        ];
    };
    AppComponent.prototype.calculateRowCount = function () {
        if (this.gridOptions.api && this.rowData) {
            var model = this.gridOptions.api.getModel();
            var totalRows = this.rowData.length;
            var processedRows = model.getVirtualRowCount();
            this.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
        }
    };
    AppComponent.prototype.onModelUpdated = function () {
        console.log('onModelUpdated');
        this.calculateRowCount();
    };
    AppComponent.prototype.onReady = function () {
        console.log('onReady');
        this.calculateRowCount();
    };
    AppComponent.prototype.onCellClicked = function ($event) {
        console.log('onCellClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
    };
    AppComponent.prototype.onCellValueChanged = function ($event) {
        console.log('onCellValueChanged: ' + $event.oldValue + ' to ' + $event.newValue);
    };
    AppComponent.prototype.onCellDoubleClicked = function ($event) {
        console.log('onCellDoubleClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
    };
    AppComponent.prototype.onCellContextMenu = function ($event) {
        console.log('onCellContextMenu: ' + $event.rowIndex + ' ' + $event.colDef.field);
    };
    AppComponent.prototype.onCellFocused = function ($event) {
        console.log('onCellFocused: (' + $event.rowIndex + ',' + $event.colIndex + ')');
    };
    AppComponent.prototype.onRowSelected = function ($event) {
        console.log('onRowSelected: ' + $event.node.data.name);
    };
    AppComponent.prototype.onSelectionChanged = function () {
        console.log('selectionChanged');
    };
    AppComponent.prototype.onBeforeFilterChanged = function () {
        console.log('beforeFilterChanged');
    };
    AppComponent.prototype.onAfterFilterChanged = function () {
        console.log('afterFilterChanged');
    };
    AppComponent.prototype.onFilterModified = function () {
        console.log('onFilterModified');
    };
    AppComponent.prototype.onBeforeSortChanged = function () {
        console.log('onBeforeSortChanged');
    };
    AppComponent.prototype.onAfterSortChanged = function () {
        console.log('onAfterSortChanged');
    };
    AppComponent.prototype.onVirtualRowRemoved = function ($event) {
    };
    AppComponent.prototype.onRowClicked = function ($event) {
        console.log('onRowClicked: ' + $event.node.data.time);
    };
    AppComponent.prototype.onQuickFilterChanged = function ($event) {
        this.gridOptions.api.setQuickFilter($event.target.value);
    };
    AppComponent.prototype.onColumnEvent = function ($event) {
        console.log('onColumnEvent: ' + $event);
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: 'component/appcomponent.html',
            directives: [main_1.AgGridNg2],
            providers: http_1.HTTP_PROVIDERS,
            styles: ['.toolbar button {margin: 2px; padding: 0px;}'],
        }), 
        __metadata('design:paramtypes', [http_1.Http])
    ], AppComponent);
    return AppComponent;
})();
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map