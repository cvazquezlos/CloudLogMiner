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
        this.rowData = [{
                timestamp: 12345,
                message: "uhu",
                level: "error",
                path: "hhh" }];
        this.list();
        this.createColumnDefs();
        this.showGrid = true;
    }
    /* rowData:any[];
     gridOptions = {
 
         columnDefs: this.columnDefs,
 
         enableFilter: true,
 
         enableSorting: true,
 
         showToolPanel: true
 
     };
     columnDefs =
         function() {
             let poni=[]
             this.rowData.forEach(log=>{
                 poni.push(Object.getOwnPropertyNames(log))
             });
             console.log(poni);
             return poni;
         };*/
    AppComponent.prototype.list = function () {
        var _this = this;
        this._elasticService.listIndices()
            .subscribe(function (list) {
            var todos = [];
            list.forEach(function (index) {
                _this._elasticService.listAllLogs(index)
                    .subscribe(function (data) {
                    todos = todos.concat(data);
                    console.log(todos);
                    _this.rowData = todos;
                    _this.gridOptions.api.setRowData(todos);
                });
            });
        });
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
    AppComponent.prototype.createColumnDefs = function () {
        this.columnDefs = [
            {
                headerName: '@timestamp'
            },
            {
                headerName: 'message'
            },
            {
                headerName: 'logger_name'
            },
            {
                headerName: 'level'
            },
            {
                headerName: 'path'
            }
        ];
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: 'templates/appcomponent.html',
            directives: [main_1.AgGridNg2]
        }), 
        __metadata('design:paramtypes', [elastic_service_1.ElasticService])
    ], AppComponent);
    return AppComponent;
})();
exports.AppComponent = AppComponent;
//# sourceMappingURL=app.component.js.map