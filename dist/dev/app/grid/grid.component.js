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
var core_1 = require('@angular/core');
var main_1 = require('ag-grid-ng2/main');
var DateUtils_1 = require('../shared/utils/DateUtils');
var elastic_service_1 = require("../shared/services/elastic.service");
var filesTree_component_1 = require("../shared/filesTree/filesTree.component");
var formatter_1 = require('../shared/utils/formatter');
var GridComponent = (function () {
    function GridComponent(_elasticService) {
        this._elasticService = _elasticService;
        this.errorMessage = { text: "", type: "" };
        this.defaultFrom = new Date(new Date().valueOf() - (10 * 60 * 60 * 1000));
        this.defaultTo = new Date(new Date().valueOf() - (1 * 60 * 60 * 1000));
        this.treeHidden = false;
        this.showLoadMore = false;
        this.showLoadEarlier = false;
        this.earliestDate = new Date(0);
        this.gridOptions = {};
        this.createColumnDefs();
        this.showGrid = true;
        this.searchByRelevance = false;
        this.errorMessage.text = "";
    }
    GridComponent.prototype.ngAfterContentInit = function () {
        this.createRowData();
    };
    GridComponent.prototype.createRowData = function () {
        var _this = this;
        this.rowData = [];
        this._elasticService.getRowsDefault()
            .subscribe(function (res) {
            _this.rowData = _this.rowData.concat(res);
            _this.rowData = _this.rowData.slice();
        }, function (err) { _this.subscribeError("Error when default fetching. " + err); }, function (complete) { return _this.subscribeComplete(); });
    };
    GridComponent.prototype.search = function (input) {
        var _this = this;
        this.gridOptions.api.showLoadingOverlay();
        this.rowData = [];
        this._elasticService.search(input, this.searchByRelevance).subscribe(function (res) {
            _this.gridOptions.api.hideOverlay();
            _this.rowData = _this.rowData.concat(res);
            _this.rowData = _this.rowData.slice();
        }, function (err) { return _this.subscribeError("Error when searching. " + err); }, function (complete) { return _this.subscribeComplete(); });
    };
    GridComponent.prototype.mark = function (input) {
        var i = 0;
        for (var _i = 0, _a = this.rowData; _i < _a.length; _i++) {
            var row = _a[_i];
            if (!row.marked) {
                for (var field in row) {
                    if (row.hasOwnProperty(field) && field != "marked") {
                        if (row[field].toLowerCase().indexOf(input.toLowerCase()) != -1) {
                            this.rowData[i].marked = true;
                            break;
                        }
                        else {
                            this.rowData[i].marked = false;
                        }
                    }
                }
            }
            i++;
        }
        this.currentFilter = input;
        this.gridOptions.api.softRefreshView();
    };
    GridComponent.prototype.loadByDate = function (to, from) {
        var _this = this;
        if (from < to) {
            this.gridOptions.api.showLoadingOverlay();
            this.rowData = [];
            this._elasticService.loadByDate(to, from).subscribe(function (res) {
                _this.gridOptions.api.hideOverlay();
                _this.rowData = _this.rowData.concat(res);
                _this.rowData = _this.rowData.slice();
            }, function (err) { return _this.subscribeError("Error when loading by date. " + err); }, function (complete) { return _this.subscribeComplete(); });
        }
        else {
            this.setErrorAlert("Please enter a valid date", "error");
        }
    };
    GridComponent.prototype.loadMore = function (loadLater) {
        var _this = this;
        this.gridOptions.api.showLoadingOverlay();
        var r = this.rowCount.split("/");
        var lastLog = this.rowData[parseInt(r[0]) - 1];
        var log = {};
        if (loadLater) {
            log = lastLog;
        }
        else {
            log = this.rowData[0];
        }
        this._elasticService.loadMore(log, loadLater).subscribe(function (res) {
            _this.gridOptions.api.hideOverlay();
            if (loadLater) {
                _this.rowData = _this.rowData.concat(res);
            }
            else {
                _this.rowData = res.concat(_this.rowData);
            }
            _this.rowData = _this.rowData.slice();
        }, function (err) { return _this.subscribeError("Error when further fetching"); }, function (complete) { return _this.subscribeComplete(); });
    };
    GridComponent.prototype.getDirectories = function () {
        return formatter_1.getDirectories(this.rowData);
    };
    GridComponent.prototype.dirChecked = function (dir) {
        var _this = this;
        this.rowData = [];
        this._elasticService.loadByFile(dir).subscribe(function (res) {
            _this.gridOptions.api.hideOverlay();
            _this.rowData = _this.rowData.concat(res);
            _this.rowData = _this.rowData.slice();
        });
    };
    GridComponent.prototype.dirUnchecked = function (dir) {
        console.log(dir);
    };
    GridComponent.prototype.subscribeComplete = function () {
        console.log("Done");
        if (this.currentFilter) {
            this.mark(this.currentFilter);
        }
        if (this.rowData.length > 49) {
            this.showLoadMore = true;
        }
        this.errorMessage.text = "";
        this.directories = this.getDirectories();
        if (this.rowData) {
            var firstTime = this.rowData[0].time || this.rowData[0]["@timestamp"];
            this.earliestDate = this.earliestDate > firstTime ? this.earliestDate : firstTime;
            if (this.earliestDate !== firstTime) {
                this.showLoadEarlier = true;
            }
        }
    };
    GridComponent.prototype.subscribeError = function (err) {
        this.setErrorAlert(err, "error");
    };
    GridComponent.prototype.createColumnDefs = function () {
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
                headerName: 'Time',
                width: 200,
                checkboxSelection: false,
                field: "time",
                pinned: false,
                volatile: true,
                cellClass: marked
            },
            {
                headerName: 'L',
                width: 60,
                checkboxSelection: false,
                field: "level",
                pinned: false,
                volatile: true,
                cellClass: function (params) {
                    return [logLevel(params), marked(params)];
                }
            },
            {
                headerName: 'Type',
                width: 60,
                checkboxSelection: false,
                field: "type",
                pinned: false,
                volatile: true,
                cellClass: marked
            },
            {
                headerName: 'Thread',
                width: 80,
                checkboxSelection: false,
                field: "thread",
                pinned: false,
                volatile: true,
                cellClass: marked
            },
            {
                headerName: 'Message',
                width: 600,
                checkboxSelection: false,
                field: "message",
                pinned: false,
                volatile: true,
                cellClass: marked
            },
            {
                headerName: 'Logger',
                width: 300,
                checkboxSelection: false,
                field: "logger",
                pinned: false,
                volatile: true,
                cellClass: marked
            },
            {
                headerName: 'Host',
                width: 200,
                checkboxSelection: false,
                field: "host",
                pinned: false,
                volatile: true,
                cellClass: marked
            },
            {
                headerName: 'Path',
                width: 300,
                checkboxSelection: false,
                field: "path",
                pinned: false,
                volatile: true,
                cellClass: marked
            }
        ];
    };
    GridComponent.prototype.calculateRowCount = function () {
        if (this.gridOptions.api && this.rowData) {
            var model = this.gridOptions.api.getModel();
            var totalRows = this.rowData.length;
            var processedRows = model.getRowCount();
            this.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
        }
    };
    GridComponent.prototype.onModelUpdated = function () {
        console.log('onModelUpdated');
        this.calculateRowCount();
    };
    GridComponent.prototype.onReady = function () {
        console.log('onReady');
        this.calculateRowCount();
    };
    GridComponent.prototype.toggleTree = function (newState) {
        this.treeHidden = newState;
    };
    GridComponent.prototype.onCellClicked = function ($event) {
        console.log('onCellClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
    };
    GridComponent.prototype.onCellValueChanged = function ($event) {
        console.log('onCellValueChanged: ' + $event.oldValue + ' to ' + $event.newValue);
    };
    GridComponent.prototype.onCellDoubleClicked = function ($event) {
        console.log('onCellDoubleClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
    };
    GridComponent.prototype.onCellContextMenu = function ($event) {
        console.log('onCellContextMenu: ' + $event.rowIndex + ' ' + $event.colDef.field);
    };
    GridComponent.prototype.onCellFocused = function ($event) {
        console.log('onCellFocused: (' + $event.rowIndex + ',' + $event.colIndex + ')');
    };
    GridComponent.prototype.onRowSelected = function ($event) {
        console.log('onRowSelected: ' + $event.node.data.name);
    };
    GridComponent.prototype.onSelectionChanged = function () {
        console.log('selectionChanged');
    };
    GridComponent.prototype.onBeforeFilterChanged = function () {
        console.log('beforeFilterChanged');
    };
    GridComponent.prototype.onAfterFilterChanged = function () {
        console.log('afterFilterChanged');
    };
    GridComponent.prototype.onFilterModified = function () {
        console.log('onFilterModified');
    };
    GridComponent.prototype.onBeforeSortChanged = function () {
        console.log('onBeforeSortChanged');
    };
    GridComponent.prototype.onAfterSortChanged = function () {
        console.log('onAfterSortChanged');
    };
    GridComponent.prototype.onVirtualRowRemoved = function ($event) {
    };
    GridComponent.prototype.onRowClicked = function ($event) {
        console.log('onRowClicked: ' + $event.node.data.time);
    };
    GridComponent.prototype.onColumnEvent = function ($event) {
        console.log('onColumnEvent: ' + $event);
    };
    GridComponent.prototype.getDefaultFromValue = function () {
        return DateUtils_1.toInputLiteral(this.defaultFrom);
    };
    GridComponent.prototype.getDefaultToValue = function () {
        return DateUtils_1.toInputLiteral(this.defaultTo);
    };
    GridComponent.prototype.setErrorAlert = function (message, type) {
        if (type === "error") {
            type = "danger";
        }
        this.errorMessage = {
            text: message,
            type: "alert-" + type + " alert fade in alert-dismissible"
        };
    };
    GridComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'sd-grid',
            templateUrl: 'grid.component.html',
            directives: [filesTree_component_1.FilesTree, main_1.AgGridNg2]
        }), 
        __metadata('design:paramtypes', [elastic_service_1.ElasticService])
    ], GridComponent);
    return GridComponent;
}());
exports.GridComponent = GridComponent;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9ncmlkL2dyaWQuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFHQSxxQkFBd0IsZUFBZSxDQUFDLENBQUE7QUFDeEMscUJBQXdCLGtCQUFrQixDQUFDLENBQUE7QUFFM0MsMEJBQTZCLDJCQUEyQixDQUFDLENBQUE7QUFDekQsZ0NBQTZCLG9DQUFvQyxDQUFDLENBQUE7QUFDbEUsb0NBQXdCLHlDQUF5QyxDQUFDLENBQUE7QUFFbEUsMEJBQTZCLDJCQUEyQixDQUFDLENBQUE7QUFlekQ7SUF1QkUsdUJBQW9CLGVBQThCO1FBQTlCLG9CQUFlLEdBQWYsZUFBZSxDQUFlO1FBVDNDLGlCQUFZLEdBQStCLEVBQUMsSUFBSSxFQUFDLEVBQUUsRUFBRSxJQUFJLEVBQUMsRUFBRSxFQUFDLENBQUM7UUFHN0QsZ0JBQVcsR0FBRyxJQUFJLElBQUksQ0FBQyxJQUFJLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUNyRSxjQUFTLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUM7UUFFbEUsZUFBVSxHQUFHLEtBQUssQ0FBQztRQUl6QixJQUFJLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQztRQUMxQixJQUFJLENBQUMsZUFBZSxHQUFHLEtBQUssQ0FBQztRQUM3QixJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRWhDLElBQUksQ0FBQyxXQUFXLEdBQWdCLEVBRS9CLENBQUM7UUFFRixJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENB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R0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBS00scUNBQWEsR0FBcEIsVUFBcUIsTUFBTTtRQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixHQUFHLE1BQU0sQ0FBQyxDQUFDO0lBQzFDLENBQUM7SUFHRCwyQ0FBbUIsR0FBbkI7UUFDRSxNQUFNLENBQUMsMEJBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELHlDQUFpQixHQUFqQjtRQUNFLE1BQU0sQ0FBQywwQkFBYyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRU8scUNBQWEsR0FBckIsVUFBc0IsT0FBYyxFQUFFLElBQVc7UUFDL0MsRUFBRSxDQUFBLENBQUMsSUFBSSxLQUFHLE9BQU8sQ0FBQyxDQUFBLENBQUM7WUFDakIsSUFBSSxHQUFHLFFBQVEsQ0FBQztRQUNsQixDQUFDO1FBQ0QsSUFBSSxDQUFDLFlBQVksR0FBRztZQUNsQixJQUFJLEVBQUUsT0FBTztZQUNiLElBQUksRUFBRSxRQUFRLEdBQUMsSUFBSSxHQUFDLGtDQUFrQztTQUN2RCxDQUFBO0lBQ0gsQ0FBQztJQTdYSDtRQUFDLGdCQUFTLENBQUM7WUFDVCxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7WUFDbkIsUUFBUSxFQUFFLFNBQVM7WUFDbkIsV0FBVyxFQUFFLHFCQUFxQjtZQUNsQyxVQUFVLEVBQUUsQ0FBQywrQkFBUyxFQUFFLGdCQUFTLENBQUM7U0FDbkMsQ0FBQzs7cUJBQUE7SUF5WEYsb0JBQUM7QUFBRCxDQXhYQSxBQXdYQyxJQUFBO0FBeFhZLHFCQUFhLGdCQXdYekIsQ0FBQSIsImZpbGUiOiJhcHAvZ3JpZC9ncmlkLmNvbXBvbmVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSBzaWx2aWEgb24gMjYvMi8xNi5cbiAqL1xuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtBZ0dyaWROZzJ9IGZyb20gJ2FnLWdyaWQtbmcyL21haW4nO1xuaW1wb3J0IHtHcmlkT3B0aW9uc30gZnJvbSAnYWctZ3JpZC9tYWluJztcbmltcG9ydCB7dG9JbnB1dExpdGVyYWx9IGZyb20gJy4uL3NoYXJlZC91dGlscy9EYXRlVXRpbHMnO1xuaW1wb3J0IHtFbGFzdGljU2VydmljZX0gZnJvbSBcIi4uL3NoYXJlZC9zZXJ2aWNlcy9lbGFzdGljLnNlcnZpY2VcIjtcbmltcG9ydCB7RmlsZXNUcmVlfSBmcm9tIFwiLi4vc2hhcmVkL2ZpbGVzVHJlZS9maWxlc1RyZWUuY29tcG9uZW50XCI7XG5pbXBvcnQge0RpcmVjdG9yeX0gZnJvbSBcIi4uL3NoYXJlZC9maWxlc1RyZWUvZGlyZWN0b3J5XCI7XG5pbXBvcnQge2dldERpcmVjdG9yaWVzfSBmcm9tICcuLi9zaGFyZWQvdXRpbHMvZm9ybWF0dGVyJztcblxuLypAQ29tcG9uZW50KHtcbiAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgc2VsZWN0b3I6ICdteS1hcHAnLFxuICB0ZW1wbGF0ZVVybDogJ2dyaWQuY29tcG9uZW50Lmh0bWwnLFxuICBkaXJlY3RpdmVzOiBbQWdHcmlkTmcyLCBGaWxlc1RyZWVdLFxuICBzdHlsZXM6IFsnLnRvb2xiYXIgYnV0dG9uIHttYXJnaW46IDJweDsgcGFkZGluZzogMHB4O30nXSxcbn0pKi9cbkBDb21wb25lbnQoe1xuICBtb2R1bGVJZDogbW9kdWxlLmlkLFxuICBzZWxlY3RvcjogJ3NkLWdyaWQnLFxuICB0ZW1wbGF0ZVVybDogJ2dyaWQuY29tcG9uZW50Lmh0bWwnLFxuICBkaXJlY3RpdmVzOiBbRmlsZXNUcmVlLCBBZ0dyaWROZzJdXG59KVxuZXhwb3J0IGNsYXNzIEdyaWRDb21wb25lbnQge1xuXG4gIHB1YmxpYyBncmlkT3B0aW9uczpHcmlkT3B0aW9ucztcbiAgcHJpdmF0ZSBzaG93R3JpZDpib29sZWFuO1xuICBwdWJsaWMgcm93RGF0YTphbnlbXTtcbiAgcHJpdmF0ZSBjb2x1bW5EZWZzOmFueVtdO1xuICBwcml2YXRlIHJvd0NvdW50OnN0cmluZztcblxuICBwcml2YXRlIHNob3dMb2FkTW9yZTpib29sZWFuO1xuICBwcml2YXRlIHNob3dMb2FkRWFybGllcjpib29sZWFuO1xuICBwcml2YXRlIGVhcmxpZXN0RGF0ZTogRGF0ZTtcblxuICBwcml2YXRlIHNlYXJjaEJ5UmVsZXZhbmNlOmJvb2xlYW47XG4gIHB1YmxpYyBjdXJyZW50RmlsdGVyOnN0cmluZztcbiAgcHVibGljIGVycm9yTWVzc2FnZToge3RleHQ6c3RyaW5nLCB0eXBlOnN0cmluZ30gPSB7dGV4dDpcIlwiLCB0eXBlOlwiXCJ9O1xuICBwdWJsaWMgZGlyZWN0b3JpZXM6QXJyYXk8RGlyZWN0b3J5PjtcblxuICBwcml2YXRlIGRlZmF1bHRGcm9tID0gbmV3IERhdGUobmV3IERhdGUoKS52YWx1ZU9mKCkgLSAoMTAgKiA2MCAqIDYwICogMTAwMCkpO1xuICBwcml2YXRlIGRlZmF1bHRUbyA9IG5ldyBEYXRlKG5ldyBEYXRlKCkudmFsdWVPZigpIC0gKDEgKiA2MCAqIDYwICogMTAwMCkpO1xuXG4gIHByaXZhdGUgdHJlZUhpZGRlbiA9IGZhbHNlO1xuXG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBfZWxhc3RpY1NlcnZpY2U6RWxhc3RpY1NlcnZpY2UpIHtcbiAgICB0aGlzLnNob3dMb2FkTW9yZSA9IGZhbHNlO1xuICAgIHRoaXMuc2hvd0xvYWRFYXJsaWVyID0gZmFsc2U7XG4gICAgdGhpcy5lYXJsaWVzdERhdGUgPSBuZXcgRGF0ZSgwKTtcbiAgICAvLyB3ZSBwYXNzIGFuIGVtcHR5IGdyaWRPcHRpb25zIGluLCBzbyB3ZSBjYW4gZ3JhYiB0aGUgYXBpIG91dFxuICAgIHRoaXMuZ3JpZE9wdGlvbnMgPSA8R3JpZE9wdGlvbnM+e1xuICAgICAgLy9lbmFibGVTZXJ2ZXJTaWRlU29ydGluZzogdHJ1ZVxuICAgIH07XG4gICAgLy90aGlzLnJvd0RhdGE9W107XG4gICAgdGhpcy5jcmVhdGVDb2x1bW5EZWZzKCk7XG4gICAgdGhpcy5zaG93R3JpZCA9IHRydWU7XG4gICAgdGhpcy5zZWFyY2hCeVJlbGV2YW5jZSA9IGZhbHNlO1xuICAgIHRoaXMuZXJyb3JNZXNzYWdlLnRleHQgPSBcIlwiO1xuICB9XG5cbiAgbmdBZnRlckNvbnRlbnRJbml0KCkgeyAgICAgICAgIC8vSXQgbmVlZHMgdG8gYmUgZG9uZSBhZnRlciB0aGUgZ3JpZCBhcGkgaGFzIGJlZW4gc2V0LCB0byBiZSBhYmxlIHRvIHVzZSBpdHMgbWV0aG9kc1xuICAgIHRoaXMuY3JlYXRlUm93RGF0YSgpO1xuICB9XG5cbiAgcHVibGljIGNyZWF0ZVJvd0RhdGEoKSB7XG4gICAgLy90aGlzLmdyaWRPcHRpb25zLmFwaS5zaG93TG9hZGluZ092ZXJsYXkoKTtcbiAgICB0aGlzLnJvd0RhdGEgPSBbXTtcbiAgICB0aGlzLl9lbGFzdGljU2VydmljZS5nZXRSb3dzRGVmYXVsdCgpXG4gICAgICAuc3Vic2NyaWJlKFxuICAgICAgICAocmVzKT0+IHtcbiAgICAgICAgICAvL3RoaXMuZ3JpZE9wdGlvbnMuYXBpLmhpZGVPdmVybGF5KCk7IFRPRE8gaXQgYnJlYWtzIHRoZSB0ZXN0XG4gICAgICAgICAgdGhpcy5yb3dEYXRhID0gdGhpcy5yb3dEYXRhLmNvbmNhdChyZXMpO1xuICAgICAgICAgIHRoaXMucm93RGF0YSA9IHRoaXMucm93RGF0YS5zbGljZSgpO1xuICAgICAgICB9LFxuICAgICAgICAoZXJyKT0+IHsgdGhpcy5zdWJzY3JpYmVFcnJvcihcIkVycm9yIHdoZW4gZGVmYXVsdCBmZXRjaGluZy4gXCIgKyBlcnIpfSxcbiAgICAgICAgKGNvbXBsZXRlKSA9PiB0aGlzLnN1YnNjcmliZUNvbXBsZXRlKCkpO1xuICB9XG5cbiAgcHVibGljIHNlYXJjaChpbnB1dDpzdHJpbmcpIHtcbiAgICB0aGlzLmdyaWRPcHRpb25zLmFwaS5zaG93TG9hZGluZ092ZXJsYXkoKTtcbiAgICB0aGlzLnJvd0RhdGEgPSBbXTsgICAgICAgICAgICAgICAgLy9SRVNUQVJUIFJPVyBEQVRBIG9yIGl0IHdpbGwgYmUgYXBwZW5kZWQgYWZ0ZXIgZGVmYXVsdCByb3dzXG4gICAgdGhpcy5fZWxhc3RpY1NlcnZpY2Uuc2VhcmNoKGlucHV0LCB0aGlzLnNlYXJjaEJ5UmVsZXZhbmNlKS5zdWJzY3JpYmUoKHJlcyk9PiB7XG4gICAgICAgIHRoaXMuZ3JpZE9wdGlvbnMuYXBpLmhpZGVPdmVybGF5KCk7XG4gICAgICAgIHRoaXMucm93RGF0YSA9IHRoaXMucm93RGF0YS5jb25jYXQocmVzKTtcbiAgICAgICAgdGhpcy5yb3dEYXRhID0gdGhpcy5yb3dEYXRhLnNsaWNlKCk7XG4gICAgICB9LCAoZXJyKT0+IHRoaXMuc3Vic2NyaWJlRXJyb3IoXCJFcnJvciB3aGVuIHNlYXJjaGluZy4gXCIgKyBlcnIpLFxuICAgICAgKGNvbXBsZXRlKSA9PiB0aGlzLnN1YnNjcmliZUNvbXBsZXRlKCkpO1xuICB9XG5cbiAgcHVibGljIG1hcmsoaW5wdXQ6c3RyaW5nKSB7XG4gICAgbGV0IGkgPSAwO1xuICAgIGZvciAobGV0IHJvdyBvZiB0aGlzLnJvd0RhdGEpIHtcbiAgICAgIGlmICghcm93Lm1hcmtlZCkge1xuICAgICAgICBmb3IgKGxldCBmaWVsZCBpbiByb3cpIHtcbiAgICAgICAgICBpZiAocm93Lmhhc093blByb3BlcnR5KGZpZWxkKSAmJiBmaWVsZCAhPSBcIm1hcmtlZFwiKSB7ICAgICAgICAvL0NoZWNrIHRoYXQgcHJvcGVydHkgZG9lc24ndCBiZWxvbmcgdG8gcHJvdG90eXBlICYgYm9vbGVhbiBjYW5ub3QgYmUgc2VhcmNoZWRcbiAgICAgICAgICAgIGlmIChyb3dbZmllbGRdLnRvTG93ZXJDYXNlKCkuaW5kZXhPZihpbnB1dC50b0xvd2VyQ2FzZSgpKSAhPSAtMSkge1xuICAgICAgICAgICAgICB0aGlzLnJvd0RhdGFbaV0ubWFya2VkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aGlzLnJvd0RhdGFbaV0ubWFya2VkID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpKys7XG4gICAgfVxuICAgIHRoaXMuY3VycmVudEZpbHRlciA9IGlucHV0O1xuICAgIHRoaXMuZ3JpZE9wdGlvbnMuYXBpLnNvZnRSZWZyZXNoVmlldygpO1xuICB9XG5cbiAgcHVibGljIGxvYWRCeURhdGUodG86RGF0ZSwgZnJvbTpEYXRlKSB7XG4gICAgaWYgKGZyb20gPCB0bykge1xuICAgICAgdGhpcy5ncmlkT3B0aW9ucy5hcGkuc2hvd0xvYWRpbmdPdmVybGF5KCk7XG4gICAgICB0aGlzLnJvd0RhdGEgPSBbXTtcbiAgICAgIHRoaXMuX2VsYXN0aWNTZXJ2aWNlLmxvYWRCeURhdGUodG8sIGZyb20pLnN1YnNjcmliZSgocmVzKSA9PiB7XG4gICAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5hcGkuaGlkZU92ZXJsYXkoKTtcbiAgICAgICAgICB0aGlzLnJvd0RhdGEgPSB0aGlzLnJvd0RhdGEuY29uY2F0KHJlcyk7XG4gICAgICAgICAgdGhpcy5yb3dEYXRhID0gdGhpcy5yb3dEYXRhLnNsaWNlKCk7XG4gICAgICAgIH0sIChlcnIpPT4gdGhpcy5zdWJzY3JpYmVFcnJvcihcIkVycm9yIHdoZW4gbG9hZGluZyBieSBkYXRlLiBcIiArIGVyciksXG4gICAgICAgIChjb21wbGV0ZSkgPT4gdGhpcy5zdWJzY3JpYmVDb21wbGV0ZSgpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5zZXRFcnJvckFsZXJ0KFwiUGxlYXNlIGVudGVyIGEgdmFsaWQgZGF0ZVwiLCBcImVycm9yXCIpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBsb2FkTW9yZShsb2FkTGF0ZXI6IGJvb2xlYW4pIHtcbiAgICB0aGlzLmdyaWRPcHRpb25zLmFwaS5zaG93TG9hZGluZ092ZXJsYXkoKTtcbiAgICBsZXQgciA9IHRoaXMucm93Q291bnQuc3BsaXQoXCIvXCIpOyAgICAgICAgICAgLy9OdW1iZXIgb2YgZGlzcGxheWVkIGxvZ3MgY29tZXMgZnJvbSB0aGUgZ3JpZFxuICAgIGxldCBsYXN0TG9nID0gdGhpcy5yb3dEYXRhW3BhcnNlSW50KHJbMF0pIC0gMV07XG5cbiAgICBsZXQgbG9nPXt9O1xuICAgIGlmKGxvYWRMYXRlcikge1xuICAgICAgICBsb2cgPSBsYXN0TG9nO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxvZyA9IHRoaXMucm93RGF0YVswXTtcbiAgICB9XG5cbiAgICB0aGlzLl9lbGFzdGljU2VydmljZS5sb2FkTW9yZShsb2csIGxvYWRMYXRlcikuc3Vic2NyaWJlKChyZXMpID0+IHsgICAvL2xvYWQgZWFybGllcjogdHJ1ZSwgbG9hZCBsYXRlcjogZmFsc2VcbiAgICAgICAgdGhpcy5ncmlkT3B0aW9ucy5hcGkuaGlkZU92ZXJsYXkoKTtcbiAgICAgICAgaWYobG9hZExhdGVyKSB7XG4gICAgICAgICAgdGhpcy5yb3dEYXRhID0gdGhpcy5yb3dEYXRhLmNvbmNhdChyZXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMucm93RGF0YSA9IHJlcy5jb25jYXQodGhpcy5yb3dEYXRhKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucm93RGF0YSA9IHRoaXMucm93RGF0YS5zbGljZSgpO1xuICAgICAgfSwgKGVycik9PiB0aGlzLnN1YnNjcmliZUVycm9yKFwiRXJyb3Igd2hlbiBmdXJ0aGVyIGZldGNoaW5nXCIpLFxuICAgICAgKGNvbXBsZXRlKSA9PiB0aGlzLnN1YnNjcmliZUNvbXBsZXRlKCkpO1xuICB9XG5cblxuICBwdWJsaWMgZ2V0RGlyZWN0b3JpZXMoKSB7XG4gICAgcmV0dXJuIGdldERpcmVjdG9yaWVzKHRoaXMucm93RGF0YSk7XG4gIH1cblxuICBwcml2YXRlIGRpckNoZWNrZWQoZGlyKSB7XG4gICAgdGhpcy5yb3dEYXRhID0gW107XG4gICAgdGhpcy5fZWxhc3RpY1NlcnZpY2UubG9hZEJ5RmlsZShkaXIpLnN1YnNjcmliZSgocmVzKSA9PiB7XG4gICAgICB0aGlzLmdyaWRPcHRpb25zLmFwaS5oaWRlT3ZlcmxheSgpO1xuICAgICAgdGhpcy5yb3dEYXRhID0gdGhpcy5yb3dEYXRhLmNvbmNhdChyZXMpO1xuICAgICAgdGhpcy5yb3dEYXRhID0gdGhpcy5yb3dEYXRhLnNsaWNlKCk7XG4gICAgfSk7XG4gIH1cblxuICBwcml2YXRlIGRpclVuY2hlY2tlZChkaXIpIHtcbiAgICBjb25zb2xlLmxvZyhkaXIpO1xuICB9XG5cbiAgcHJpdmF0ZSBzdWJzY3JpYmVDb21wbGV0ZSgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkRvbmVcIik7XG4gICAgLy9OZWVkIHRvIGFwcGx5IHRoZSBtYXJrZXJcbiAgICBpZiAodGhpcy5jdXJyZW50RmlsdGVyKSB7XG4gICAgICAgIHRoaXMubWFyayh0aGlzLmN1cnJlbnRGaWx0ZXIpO1xuICAgIH1cbiAgICBpZiAodGhpcy5yb3dEYXRhLmxlbmd0aCA+IDQ5KSB7XG4gICAgICAgIHRoaXMuc2hvd0xvYWRNb3JlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmVycm9yTWVzc2FnZS50ZXh0ID0gXCJcIjtcbiAgICB0aGlzLmRpcmVjdG9yaWVzID0gdGhpcy5nZXREaXJlY3RvcmllcygpO1xuXG4gICAgaWYodGhpcy5yb3dEYXRhKSB7XG4gICAgICBsZXQgZmlyc3RUaW1lID0gdGhpcy5yb3dEYXRhWzBdLnRpbWUgfHwgdGhpcy5yb3dEYXRhWzBdW1wiQHRpbWVzdGFtcFwiXTtcbiAgICAgIHRoaXMuZWFybGllc3REYXRlID0gdGhpcy5lYXJsaWVzdERhdGU+Zmlyc3RUaW1lPyB0aGlzLmVhcmxpZXN0RGF0ZSA6IGZpcnN0VGltZTtcblxuICAgICAgaWYodGhpcy5lYXJsaWVzdERhdGUhPT1maXJzdFRpbWUpIHtcbiAgICAgICAgdGhpcy5zaG93TG9hZEVhcmxpZXIgPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICB9XG5cbiAgcHJpdmF0ZSBzdWJzY3JpYmVFcnJvcihlcnI6IHN0cmluZykge1xuICAgIHRoaXMuc2V0RXJyb3JBbGVydChlcnIsIFwiZXJyb3JcIik7XG4gIH1cblxuXG4gIHB1YmxpYyBjcmVhdGVDb2x1bW5EZWZzKCkge1xuICAgIGxldCBsb2dMZXZlbCA9IChwYXJhbXMpID0+IHtcbiAgICAgIGlmIChwYXJhbXMuZGF0YS5sZXZlbCA9PT0gJ0VSUk9SJykge1xuICAgICAgICByZXR1cm4gJ2xvZy1sZXZlbC1lcnJvciAnXG4gICAgICB9IGVsc2UgaWYgKHBhcmFtcy5kYXRhLmxldmVsID09PSAnV0FSTicpIHtcbiAgICAgICAgcmV0dXJuICdsb2ctbGV2ZWwtd2FybiAnXG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGxldCBtYXJrZWQgPSAocGFyYW1zKSA9PiB7XG4gICAgICBpZiAocGFyYW1zLmRhdGEubWFya2VkKSB7XG4gICAgICAgIHJldHVybiAnbWFya2VkSW5GaWx0ZXInXG4gICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuY29sdW1uRGVmcyA9IFtcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyTmFtZTogJ1RpbWUnLFxuICAgICAgICB3aWR0aDogMjAwLFxuICAgICAgICBjaGVja2JveFNlbGVjdGlvbjogZmFsc2UsXG4gICAgICAgIGZpZWxkOiBcInRpbWVcIixcbiAgICAgICAgcGlubmVkOiBmYWxzZSxcbiAgICAgICAgdm9sYXRpbGU6IHRydWUsXG4gICAgICAgIGNlbGxDbGFzczogbWFya2VkXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBoZWFkZXJOYW1lOiAnTCcsXG4gICAgICAgIHdpZHRoOiA2MCxcbiAgICAgICAgY2hlY2tib3hTZWxlY3Rpb246IGZhbHNlLFxuICAgICAgICBmaWVsZDogXCJsZXZlbFwiLFxuICAgICAgICBwaW5uZWQ6IGZhbHNlLFxuICAgICAgICB2b2xhdGlsZTogdHJ1ZSxcbiAgICAgICAgY2VsbENsYXNzOiAocGFyYW1zKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIFtsb2dMZXZlbChwYXJhbXMpLCBtYXJrZWQocGFyYW1zKV1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyTmFtZTogJ1R5cGUnLFxuICAgICAgICB3aWR0aDogNjAsXG4gICAgICAgIGNoZWNrYm94U2VsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgZmllbGQ6IFwidHlwZVwiLFxuICAgICAgICBwaW5uZWQ6IGZhbHNlLFxuICAgICAgICB2b2xhdGlsZTogdHJ1ZSxcbiAgICAgICAgY2VsbENsYXNzOiBtYXJrZWRcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGhlYWRlck5hbWU6ICdUaHJlYWQnLFxuICAgICAgICB3aWR0aDogODAsXG4gICAgICAgIGNoZWNrYm94U2VsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgZmllbGQ6IFwidGhyZWFkXCIsXG4gICAgICAgIHBpbm5lZDogZmFsc2UsXG4gICAgICAgIHZvbGF0aWxlOiB0cnVlLFxuICAgICAgICBjZWxsQ2xhc3M6IG1hcmtlZFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgaGVhZGVyTmFtZTogJ01lc3NhZ2UnLFxuICAgICAgICB3aWR0aDogNjAwLFxuICAgICAgICBjaGVja2JveFNlbGVjdGlvbjogZmFsc2UsXG4gICAgICAgIGZpZWxkOiBcIm1lc3NhZ2VcIixcbiAgICAgICAgcGlubmVkOiBmYWxzZSxcbiAgICAgICAgdm9sYXRpbGU6IHRydWUsXG4gICAgICAgIGNlbGxDbGFzczogbWFya2VkXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBoZWFkZXJOYW1lOiAnTG9nZ2VyJyxcbiAgICAgICAgd2lkdGg6IDMwMCxcbiAgICAgICAgY2hlY2tib3hTZWxlY3Rpb246IGZhbHNlLFxuICAgICAgICBmaWVsZDogXCJsb2dnZXJcIixcbiAgICAgICAgcGlubmVkOiBmYWxzZSxcbiAgICAgICAgdm9sYXRpbGU6IHRydWUsXG4gICAgICAgIGNlbGxDbGFzczogbWFya2VkXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBoZWFkZXJOYW1lOiAnSG9zdCcsXG4gICAgICAgIHdpZHRoOiAyMDAsXG4gICAgICAgIGNoZWNrYm94U2VsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgZmllbGQ6IFwiaG9zdFwiLFxuICAgICAgICBwaW5uZWQ6IGZhbHNlLFxuICAgICAgICB2b2xhdGlsZTogdHJ1ZSxcbiAgICAgICAgY2VsbENsYXNzOiBtYXJrZWRcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGhlYWRlck5hbWU6ICdQYXRoJyxcbiAgICAgICAgd2lkdGg6IDMwMCxcbiAgICAgICAgY2hlY2tib3hTZWxlY3Rpb246IGZhbHNlLFxuICAgICAgICBmaWVsZDogXCJwYXRoXCIsXG4gICAgICAgIHBpbm5lZDogZmFsc2UsXG4gICAgICAgIHZvbGF0aWxlOiB0cnVlLFxuICAgICAgICBjZWxsQ2xhc3M6IG1hcmtlZFxuICAgICAgfVxuICAgIF07XG4gIH1cblxuICBwcml2YXRlIGNhbGN1bGF0ZVJvd0NvdW50KCkge1xuICAgIGlmICh0aGlzLmdyaWRPcHRpb25zLmFwaSAmJiB0aGlzLnJvd0RhdGEpIHtcbiAgICAgIGxldCBtb2RlbCA9IHRoaXMuZ3JpZE9wdGlvbnMuYXBpLmdldE1vZGVsKCk7XG4gICAgICBsZXQgdG90YWxSb3dzID0gdGhpcy5yb3dEYXRhLmxlbmd0aDtcbiAgICAgIGxldCBwcm9jZXNzZWRSb3dzID0gbW9kZWwuZ2V0Um93Q291bnQoKTtcbiAgICAgIHRoaXMucm93Q291bnQgPSBwcm9jZXNzZWRSb3dzLnRvTG9jYWxlU3RyaW5nKCkgKyAnIC8gJyArIHRvdGFsUm93cy50b0xvY2FsZVN0cmluZygpO1xuICAgIH1cbiAgfVxuXG4gIHB1YmxpYyBvbk1vZGVsVXBkYXRlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnb25Nb2RlbFVwZGF0ZWQnKTtcbiAgICB0aGlzLmNhbGN1bGF0ZVJvd0NvdW50KCk7XG4gIH1cblxuICBwdWJsaWMgb25SZWFkeSgpIHtcbiAgICBjb25zb2xlLmxvZygnb25SZWFkeScpO1xuICAgIHRoaXMuY2FsY3VsYXRlUm93Q291bnQoKTtcbiAgfVxuXG4gIHB1YmxpYyB0b2dnbGVUcmVlKG5ld1N0YXRlKSB7XG4gICAgICB0aGlzLnRyZWVIaWRkZW4gPSBuZXdTdGF0ZTtcbiAgfVxuXG4gIHB1YmxpYyBvbkNlbGxDbGlja2VkKCRldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdvbkNlbGxDbGlja2VkOiAnICsgJGV2ZW50LnJvd0luZGV4ICsgJyAnICsgJGV2ZW50LmNvbERlZi5maWVsZCk7XG4gIH1cblxuICBwdWJsaWMgb25DZWxsVmFsdWVDaGFuZ2VkKCRldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdvbkNlbGxWYWx1ZUNoYW5nZWQ6ICcgKyAkZXZlbnQub2xkVmFsdWUgKyAnIHRvICcgKyAkZXZlbnQubmV3VmFsdWUpO1xuICB9XG5cbiAgcHVibGljIG9uQ2VsbERvdWJsZUNsaWNrZWQoJGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ29uQ2VsbERvdWJsZUNsaWNrZWQ6ICcgKyAkZXZlbnQucm93SW5kZXggKyAnICcgKyAkZXZlbnQuY29sRGVmLmZpZWxkKTtcbiAgfVxuXG4gIHB1YmxpYyBvbkNlbGxDb250ZXh0TWVudSgkZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygnb25DZWxsQ29udGV4dE1lbnU6ICcgKyAkZXZlbnQucm93SW5kZXggKyAnICcgKyAkZXZlbnQuY29sRGVmLmZpZWxkKTtcbiAgfVxuXG4gIHB1YmxpYyBvbkNlbGxGb2N1c2VkKCRldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdvbkNlbGxGb2N1c2VkOiAoJyArICRldmVudC5yb3dJbmRleCArICcsJyArICRldmVudC5jb2xJbmRleCArICcpJyk7XG4gIH1cblxuICBwdWJsaWMgb25Sb3dTZWxlY3RlZCgkZXZlbnQpIHtcbiAgICBjb25zb2xlLmxvZygnb25Sb3dTZWxlY3RlZDogJyArICRldmVudC5ub2RlLmRhdGEubmFtZSk7XG4gIH1cblxuICBwdWJsaWMgb25TZWxlY3Rpb25DaGFuZ2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCdzZWxlY3Rpb25DaGFuZ2VkJyk7XG4gIH1cblxuICBwdWJsaWMgb25CZWZvcmVGaWx0ZXJDaGFuZ2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCdiZWZvcmVGaWx0ZXJDaGFuZ2VkJyk7XG4gIH1cblxuICBwdWJsaWMgb25BZnRlckZpbHRlckNoYW5nZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ2FmdGVyRmlsdGVyQ2hhbmdlZCcpO1xuICB9XG5cbiAgcHVibGljIG9uRmlsdGVyTW9kaWZpZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ29uRmlsdGVyTW9kaWZpZWQnKTtcbiAgfVxuXG4gIHB1YmxpYyBvbkJlZm9yZVNvcnRDaGFuZ2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCdvbkJlZm9yZVNvcnRDaGFuZ2VkJyk7XG4gIH1cblxuICBwdWJsaWMgb25BZnRlclNvcnRDaGFuZ2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCdvbkFmdGVyU29ydENoYW5nZWQnKTtcbiAgfVxuXG4gIHB1YmxpYyBvblZpcnR1YWxSb3dSZW1vdmVkKCRldmVudCkge1xuICAgIC8vIGJlY2F1c2UgdGhpcyBldmVudCBnZXRzIGZpcmVkIExPVFMgb2YgdGltZXMsIHdlIGRvbid0IHByaW50IGl0IHRvIHRoZVxuICAgIC8vIGNvbnNvbGUuIGlmIHlvdSB3YW50IHRvIHNlZSBpdCwganVzdCB1bmNvbW1lbnQgb3V0IHRoaXMgbGluZVxuICAgIC8vIGNvbnNvbGUubG9nKCdvblZpcnR1YWxSb3dSZW1vdmVkOiAnICsgJGV2ZW50LnJvd0luZGV4KTtcbiAgfVxuXG4gIHB1YmxpYyBvblJvd0NsaWNrZWQoJGV2ZW50KSB7XG4gICAgY29uc29sZS5sb2coJ29uUm93Q2xpY2tlZDogJyArICRldmVudC5ub2RlLmRhdGEudGltZSk7XG4gIH1cblxuXG4vLyBoZXJlIHdlIHVzZSBvbmUgZ2VuZXJpYyBldmVudCB0byBoYW5kbGUgYWxsIHRoZSBjb2x1bW4gdHlwZSBldmVudHMuXG4vLyB0aGUgbWV0aG9kIGp1c3QgcHJpbnRzIHRoZSBldmVudCBuYW1lXG4gIHB1YmxpYyBvbkNvbHVtbkV2ZW50KCRldmVudCkge1xuICAgIGNvbnNvbGUubG9nKCdvbkNvbHVtbkV2ZW50OiAnICsgJGV2ZW50KTtcbiAgfVxuXG4vLyBBVVggTUVUSE9EUyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cbiAgZ2V0RGVmYXVsdEZyb21WYWx1ZSgpIHtcbiAgICByZXR1cm4gdG9JbnB1dExpdGVyYWwodGhpcy5kZWZhdWx0RnJvbSk7XG4gIH1cblxuICBnZXREZWZhdWx0VG9WYWx1ZSgpIHtcbiAgICByZXR1cm4gdG9JbnB1dExpdGVyYWwodGhpcy5kZWZhdWx0VG8pO1xuICB9XG5cbiAgcHJpdmF0ZSBzZXRFcnJvckFsZXJ0KG1lc3NhZ2U6c3RyaW5nLCB0eXBlOnN0cmluZykge1xuICAgIGlmKHR5cGU9PT1cImVycm9yXCIpe1xuICAgICAgdHlwZSA9IFwiZGFuZ2VyXCI7XG4gICAgfVxuICAgIHRoaXMuZXJyb3JNZXNzYWdlID0ge1xuICAgICAgdGV4dDogbWVzc2FnZSxcbiAgICAgIHR5cGU6IFwiYWxlcnQtXCIrdHlwZStcIiBhbGVydCBmYWRlIGluIGFsZXJ0LWRpc21pc3NpYmxlXCJcbiAgICB9XG4gIH1cbn1cbiJdfQ==
