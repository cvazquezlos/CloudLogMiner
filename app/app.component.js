System.register(['angular2/core', 'ag-grid-ng2/main', './shared/DateUtils', "./shared/elastic.service"], function(exports_1, context_1) {
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
    var core_1, main_1, DateUtils_1, elastic_service_1;
    var AppComponent;
    return {
        setters:[
            function (core_1_1) {
                core_1 = core_1_1;
            },
            function (main_1_1) {
                main_1 = main_1_1;
            },
            function (DateUtils_1_1) {
                DateUtils_1 = DateUtils_1_1;
            },
            function (elastic_service_1_1) {
                elastic_service_1 = elastic_service_1_1;
            }],
        execute: function() {
            AppComponent = (function () {
                function AppComponent(_elasticService) {
                    this._elasticService = _elasticService;
                    this.defaultFrom = new Date(new Date().valueOf() - (10 * 60 * 60 * 1000));
                    this.defaultTo = new Date(new Date().valueOf() - (1 * 60 * 60 * 1000));
                    // we pass an empty gridOptions in, so we can grab the api out
                    this.gridOptions = {};
                    this.rowData = [];
                    this.createRowData();
                    this.createColumnDefs();
                    this.showGrid = true;
                    this.showLoadMore = true;
                    this.searchByRelevance = false;
                }
                AppComponent.prototype.createRowData = function () {
                    var _this = this;
                    //this.gridOptions.api.showLoadingOverlay();
                    this._elasticService.getRowsDefault()
                        .subscribe(function (res) {
                        _this.gridOptions.api.hideOverlay();
                        _this.rowData = _this.rowData.concat(res);
                        _this.rowData = _this.rowData.slice();
                    }, function (err) { return console.log("Error in default fetching" + err); }, function (complete) {
                        console.log("Done");
                        _this.showLoadMore = true;
                    });
                };
                AppComponent.prototype.search = function (input) {
                    var _this = this;
                    //this.gridOptions.api.showLoadingOverlay();
                    this.rowData = []; //RESTART ROW DATA or it will be appended after default rows
                    this._elasticService.search(input, this.searchByRelevance).subscribe(function (res) {
                        _this.gridOptions.api.hideOverlay();
                        _this.rowData = _this.rowData.concat(res);
                        _this.rowData = _this.rowData.slice();
                    }, function (err) { return console.log("Error in search" + err); }, function (complete) {
                        console.log("Done");
                        _this.showLoadMore = true;
                    });
                };
                AppComponent.prototype.mark = function (input) {
                    var i = 0;
                    for (var _i = 0, _a = this.rowData; _i < _a.length; _i++) {
                        var row = _a[_i];
                        for (var field in row) {
                            if (row.hasOwnProperty(field) && !row.marked) {
                                if (row[field].toLowerCase().indexOf(input.toLowerCase()) != -1) {
                                    this.rowData[i].marked = true;
                                }
                            }
                        }
                        i++;
                    }
                    this.currentFilter = input;
                    this.gridOptions.api.softRefreshView();
                };
                AppComponent.prototype.loadByDate = function (to, from) {
                    var _this = this;
                    this.rowData = [];
                    this._elasticService.loadByDate(to, from).subscribe(function (res) {
                        _this.gridOptions.api.hideOverlay();
                        _this.rowData = _this.rowData.concat(res);
                        _this.rowData = _this.rowData.slice();
                    }, function (err) { return console.log("Error in loading by date" + err); }, function (complete) {
                        console.log("Done");
                        _this.showLoadMore = true;
                    });
                };
                AppComponent.prototype.loadMore = function () {
                    var _this = this;
                    var r = this.rowCount.split("/");
                    var lastLog = this.rowData[parseInt(r[0]) - 1];
                    this._elasticService.loadMore(lastLog).subscribe(function (res) {
                        _this.gridOptions.api.hideOverlay();
                        _this.rowData = _this.rowData.concat(res);
                        _this.rowData = _this.rowData.slice();
                    }, function (err) { return console.log("Error in further fetching" + err); }, function (complete) {
                        console.log("Done");
                        _this.showLoadMore = false;
                        //Need to apply the marker
                        if (_this.currentFilter) {
                            _this.mark(_this.currentFilter);
                        }
                    });
                };
                AppComponent.prototype.createColumnDefs = function () {
                    var logLevel = function (params) {
                        if (params.data.level === 'ERROR') {
                            return 'log-level-error ';
                        }
                        else if (params.data.level === 'WARN') {
                            return 'log-level-warn ';
                        }
                        else {
                            return '';
                        }
                    };
                    var marked = function (params) {
                        if (params.data.marked) {
                            return 'markedInFilter';
                        }
                    };
                    this.columnDefs = [
                        {
                            headerName: 'Time', width: 200, checkboxSelection: false, field: "time", pinned: false, volatile: true, cellClass: marked
                        },
                        {
                            headerName: 'L', width: 60, checkboxSelection: false, field: "level", pinned: false, volatile: true, cellClass: function (params) { return [logLevel(params), marked(params)]; }
                        },
                        {
                            headerName: 'Type', width: 60, checkboxSelection: false, field: "type", pinned: false, volatile: true, cellClass: marked
                        },
                        {
                            headerName: 'Thread', width: 170, checkboxSelection: false, field: "thread", pinned: false, volatile: true, cellClass: marked
                        },
                        {
                            headerName: 'Message', width: 600, checkboxSelection: false, field: "message", pinned: false, volatile: true, cellClass: marked
                        },
                        {
                            headerName: 'Logger', width: 300, checkboxSelection: false, field: "logger", pinned: false, volatile: true, cellClass: marked
                        },
                        {
                            headerName: 'Host', width: 300, checkboxSelection: false, field: "host", pinned: false, volatile: true, cellClass: marked
                        }
                    ];
                };
                AppComponent.prototype.calculateRowCount = function () {
                    if (this.gridOptions.api && this.rowData) {
                        var model = this.gridOptions.api.getModel();
                        var totalRows = this.rowData.length;
                        var processedRows = model.getRowCount();
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
                    // because this event gets fired LOTS of times, we don't print it to the
                    // console. if you want to see it, just uncomment out this line
                    // console.log('onVirtualRowRemoved: ' + $event.rowIndex);
                };
                AppComponent.prototype.onRowClicked = function ($event) {
                    console.log('onRowClicked: ' + $event.node.data.time);
                };
                // here we use one generic event to handle all the column type events.
                // the method just prints the event name
                AppComponent.prototype.onColumnEvent = function ($event) {
                    console.log('onColumnEvent: ' + $event);
                };
                // AUX METHODS ------------------------------
                AppComponent.prototype.getDefaultFromValue = function () {
                    return DateUtils_1.toInputLiteral(this.defaultFrom);
                };
                AppComponent.prototype.getDefaultToValue = function () {
                    return DateUtils_1.toInputLiteral(this.defaultTo);
                };
                AppComponent = __decorate([
                    core_1.Component({
                        selector: 'my-app',
                        templateUrl: './app/appcomponent.html',
                        directives: [main_1.AgGridNg2],
                        //providers: HTTP_PROVIDERS,
                        styles: ['.toolbar button {margin: 2px; padding: 0px;}'],
                    }), 
                    __metadata('design:paramtypes', [elastic_service_1.ElasticService])
                ], AppComponent);
                return AppComponent;
            }());
            exports_1("AppComponent", AppComponent);
        }
    }
});
//# sourceMappingURL=app.component.js.map