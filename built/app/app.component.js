var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
/**
 * Created by silvia on 26/2/16.
 */
var core_1 = require('angular2/core');
var elastic_service_1 = require('./elastic.service');
var main_1 = require('ag-grid-ng2/main');
var AppComponent = (function () {
    function AppComponent(_elasticService) {
        this._elasticService = _elasticService;
        this.gridOptions = {};
        this.list();
        this.createColumnDefs();
        this.showGrid = true;
    }
    AppComponent.prototype.list = function () {
        var _this = this;
        this._elasticService.listIndices()
            .subscribe(function (list) {
            list.forEach(function (index) {
                _this._elasticService.listAllLogs(list[0])
                    .subscribe(function (data) {
                    var todos = [];
                    todos = todos.concat(data); //concatena al array
                    console.log(todos);
                    _this.omg = todos;
                    //console.log(poni.message);
                });
            });
        });
    };
    AppComponent.prototype.poni = function () {
        console.log("poni");
        this.rowData = this.omg;
    };
    AppComponent.prototype.createColumnDefs = function () {
        this.columnDefs = [
            {
                headerName: '@timestamp'
            },
            {
                headerName: '@version'
            },
            {
                headerName: 'HOSTNAME'
            },
            {
                headerName: 'host'
            },
            {
                headerName: 'level'
            },
            {
                headerName: 'level_value'
            },
            {
                headerName: 'logger_name'
            },
            {
                headerName: 'message'
            },
            {
                headerName: 'path'
            },
            {
                headerName: 'thread_name'
            },
            {
                headerName: 'type'
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
        this.rowData = this.omg;
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
        console.log('onRowClicked: ' + $event.node.data.name);
    };
    AppComponent.prototype.onQuickFilterChanged = function ($event) {
        this.gridOptions.api.setQuickFilter($event.target.value);
    };
    // here we use one generic event to handle all the column type events.
    // the method just prints the event name
    AppComponent.prototype.onColumnEvent = function ($event) {
        console.log('onColumnEvent: ' + $event);
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: 'templates/appcomponent.html',
            directives: [main_1.AgGridNg2],
            styles: ['.toolbar button {margin: 2px; padding: 0px;}'],
        }), 
        __metadata('design:paramtypes', [elastic_service_1.ElasticService])
    ], AppComponent);
    return AppComponent;
})();
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map