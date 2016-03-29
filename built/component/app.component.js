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
var elastic_service_1 = require("../services/elastic.service");
var AppComponent = (function () {
    function AppComponent(_elasticService) {
        this._elasticService = _elasticService;
        this.sizeOfPage = 100;
        this.dataSource = {
            pageSize: this.sizeOfPage,
            rowCount: -1,
            overflowSize: 4,
            maxConcurrentRequests: 2,
            getRows: this.getRows.bind(this)
        };
        this.gridOptions = {};
        this.gridOptions.virtualPaging = true;
        this.gridOptions.datasource = this.dataSource;
        this.rowData = [];
        this.createColumnDefs();
        this.showGrid = true;
    }
    AppComponent.prototype.getRows = function (params) {
        var _this = this;
        this.gridOptions.api.showLoadingOverlay();
        if (!this._elasticService.scrollId) {
            this._elasticService.listAllLogs(this.sizeOfPage).subscribe(function (res) {
                var data = _this.elasticLogProcessing(res);
                _this.gridOptions.api.hideOverlay();
                params.successCallback(data.slice());
            });
        }
        else {
            this._elasticService.scrollElastic().subscribe(function (res) {
                var data2 = _this.elasticLogProcessing(res);
                _this.gridOptions.api.hideOverlay();
                params.successCallback(data2.slice());
            });
        }
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
                suppressMenu: true, pinned: true, editable: true
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
    AppComponent.prototype.onSearchInputChanged = function ($event) {
        this._elasticService.search($event.target.value);
    };
    AppComponent.prototype.onColumnEvent = function ($event) {
        console.log('onColumnEvent: ' + $event);
    };
    AppComponent.prototype.elasticLogProcessing = function (res) {
        var rowData = [];
        var data = res.json();
        var id = data._scroll_id;
        this._elasticService.scrollId = id;
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
    AppComponent.prototype.getGridOptions = function () {
        return this.gridOptions;
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: 'component/appcomponent.html',
            directives: [main_1.AgGridNg2],
            styles: ['.toolbar button {margin: 2px; padding: 0px;}'],
        }), 
        __metadata('design:paramtypes', [elastic_service_1.ElasticService])
    ], AppComponent);
    return AppComponent;
})();
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map