/**
 * Created by silvia on 26/2/16.
 */
import {Component} from 'angular2/core';
import {ElasticService} from './elastic.service';
import {AgGridNg2 as Grid} from 'ag-grid-ng2/main';
import {GridOptions} from 'ag-grid/main';


@Component({
    selector: 'my-app',
    templateUrl: 'templates/appcomponent.html',
    directives:[Grid]
})
export class AppComponent {
    private gridOptions: GridOptions;
    private showGrid: boolean;
    private rowData: any[];
    private columnDefs: any[];
    private rowCount: string;

    constructor(private _elasticService: ElasticService) {
        this.gridOptions = <GridOptions>{};
        this.rowData=[{
            timestamp:12345,
            message:"uhu",
            level:"error",
            path:"hhh"}];
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




    list() {
        this._elasticService.listIndices()
            .subscribe(list=> {
                let todos:Array<any>=[];
                list.forEach(index=>{
                    this._elasticService.listAllLogs(index)
                        .subscribe(data=>{
                            todos=todos.concat(data);
                            console.log(todos);
                            this.rowData=todos;
                            this.gridOptions.api.setRowData(todos);
                        })
                });

            });
    }

    private calculateRowCount() {
        if (this.gridOptions.api && this.rowData) {
            var model = this.gridOptions.api.getModel();
            var totalRows = this.rowData.length;
            var processedRows = model.getVirtualRowCount();
            this.rowCount = processedRows.toLocaleString() + ' / ' + totalRows.toLocaleString();
        }
    }
    private onModelUpdated() {
        console.log('onModelUpdated');
        this.calculateRowCount();
    }

    private onReady() {
        console.log('onReady');
        this.calculateRowCount();
    }

    private createColumnDefs() {
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
                headerName:'path'
            }
        ];
    }
}