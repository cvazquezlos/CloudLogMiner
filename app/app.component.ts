/**
 * Created by silvia on 26/2/16.
 */
import {Component} from 'angular2/core';
import {ElasticService} from './elastic.service';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions} from 'ag-grid/main';

@Component({
    selector: 'my-app',
    templateUrl: 'templates/appcomponent.html',
    directives: [AgGridNg2],
    styles: ['.toolbar button {margin: 2px; padding: 0px;}'],
})

export class AppComponent {
    private gridOptions: GridOptions;
    private showGrid: boolean;
    private rowData: any[];
    private columnDefs: any[];
    private rowCount: string;
    private omg: any[];

    constructor(private _elasticService: ElasticService) {
        this.gridOptions = <GridOptions>{};
        this.list();
        this.createColumnDefs();
        this.showGrid = true;
    }

    list() {
        this._elasticService.listIndices()
            .subscribe(list=> {
                list.forEach(index=>{
                    this._elasticService.listAllLogs(list[0])
                        .subscribe(data=>{
                            var todos:Array<any>=[];
                            todos=todos.concat(data);           //concatena al array
                            console.log(todos);
                            this.omg=todos;
                            //console.log(poni.message);
                        })
                });

            });
    }

    poni(){
        console.log("poni");
        this.rowData=this.omg;
    }


    private createColumnDefs() {
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
        this.rowData=this.omg;
    }

    private onReady() {
        console.log('onReady');
        this.calculateRowCount();
    }

    private onCellClicked($event) {
        console.log('onCellClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
    }

    private onCellValueChanged($event) {
        console.log('onCellValueChanged: ' + $event.oldValue + ' to ' + $event.newValue);
    }

    private onCellDoubleClicked($event) {
        console.log('onCellDoubleClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
    }

    private onCellContextMenu($event) {
        console.log('onCellContextMenu: ' + $event.rowIndex + ' ' + $event.colDef.field);
    }

    private onCellFocused($event) {
        console.log('onCellFocused: (' + $event.rowIndex + ',' + $event.colIndex + ')');
    }

    private onRowSelected($event) {
        console.log('onRowSelected: ' + $event.node.data.name);
    }

    private onSelectionChanged() {
        console.log('selectionChanged');
    }

    private onBeforeFilterChanged() {
        console.log('beforeFilterChanged');
    }

    private onAfterFilterChanged() {
        console.log('afterFilterChanged');
    }

    private onFilterModified() {
        console.log('onFilterModified');
    }

    private onBeforeSortChanged() {
        console.log('onBeforeSortChanged');
    }

    private onAfterSortChanged() {
        console.log('onAfterSortChanged');
    }

    private onVirtualRowRemoved($event) {
        // because this event gets fired LOTS of times, we don't print it to the
        // console. if you want to see it, just uncomment out this line
        // console.log('onVirtualRowRemoved: ' + $event.rowIndex);
    }

    private onRowClicked($event) {
        console.log('onRowClicked: ' + $event.node.data.name);
    }

    private onQuickFilterChanged($event) {
        this.gridOptions.api.setQuickFilter($event.target.value);
    }

    // here we use one generic event to handle all the column type events.
    // the method just prints the event name
    private onColumnEvent($event) {
        console.log('onColumnEvent: ' + $event);
    }


}