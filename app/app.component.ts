import {Component} from 'angular2/core';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions} from 'ag-grid/main';
import {Http, Response, HTTP_PROVIDERS, Headers, RequestOptions, RequestMethod, Request} from 'angular2/http';
import {ElasticService} from "./shared/elastic.service";

@Component({
    selector: 'my-app',
    templateUrl: './app/appcomponent.html',
    directives: [AgGridNg2],
    //providers: HTTP_PROVIDERS,
    styles: ['.toolbar button {margin: 2px; padding: 0px;}'],
})
export class AppComponent {

    private gridOptions: GridOptions;
    private showGrid: boolean;
    private rowData: any[];
    private columnDefs: any[];
    private rowCount: string;
    private showLoadMore: boolean;

    constructor(private _elasticService:ElasticService) {
        // we pass an empty gridOptions in, so we can grab the api out
        this.gridOptions = <GridOptions>{
            //enableServerSideSorting: true
        };
        this.rowData=[];
        this.createRowData();
        this.createColumnDefs();
        this.showGrid = true;
        this.showLoadMore=true;
    }

    private createRowData(){
        //this.gridOptions.api.showLoadingOverlay();
        this._elasticService.getRowsDefault()
            .subscribe((res)=>{
                this.gridOptions.api.hideOverlay();
                this.rowData=this.rowData.concat(res);
                this.rowData=this.rowData.slice();
            },(err)=>console.log("Error in default fetching"+err),
            (complete)=>{
                console.log("Done");
                this.showLoadMore=true;
            });
    }

    private search(input:string) {
        //this.gridOptions.api.showLoadingOverlay();
        this.rowData=[];    //RESTART ROW DATA or it will be append after default rows
        this._elasticService.search(input).subscribe((res)=>{
            this.gridOptions.api.hideOverlay();
            this.rowData=this.rowData.concat(res);
            this.rowData=this.rowData.slice();
        }, (err)=>console.log("Error in search"+err),
            (complete)=>{
                console.log("Done");
                this.showLoadMore=true;
            });

    }

    private loadMore() {
        let r = this.rowCount.split("/");
        let lastLog = this.rowData[parseInt(r[0])-1];
        this._elasticService.loadMore(lastLog)/*.subscribe((res)=>{
            this.gridOptions.api.hideOverlay();
            this.rowData=this.rowData.concat(res);
            this.rowData=this.rowData.slice();
        });*/
    }



    private createColumnDefs() {

        let rowColor = function(params) {
            if (params.data.level === 'ERROR') {
                return 'log-level-error';
            } else if (params.data.level === 'WARN') {
                return 'log-level-warn';
            } else {
                return '';
            }
        };

        this.columnDefs = [
            {
                headerName: '#', width: 30, checkboxSelection: false, pinned: true, editable: true
            },
            {
                headerName: 'Time', width: 200, checkboxSelection: false, field: "time", pinned: false
            },
            {
                headerName: 'L', width: 60, checkboxSelection: false, field: "level", pinned: false, cellClass: rowColor
            },
            {
                headerName: 'Type', width: 60, checkboxSelection: false, field: "type", pinned: false
            },
            {
                headerName: 'Thread', width: 170, checkboxSelection: false, field: "thread", pinned: false
            },
            {
                headerName: 'Message', width: 600, checkboxSelection: false, field: "message", pinned: false
            },
            {
                headerName: 'Logger', width: 300, checkboxSelection: false, field: "logger", pinned: false
            },
            {
                headerName: 'Host', width: 300, checkboxSelection: false, field: "host", pinned: false
            }
        ];
    }

    private calculateRowCount() {
        if (this.gridOptions.api && this.rowData) {
            let model = this.gridOptions.api.getModel();
            let totalRows = this.rowData.length;
            let processedRows = model.getRowCount();
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
        console.log('onRowClicked: ' + $event.node.data.time);
    }

    // here we use one generic event to handle all the column type events.
    // the method just prints the event name
    private onColumnEvent($event) {
        console.log('onColumnEvent: ' + $event);
    }

}

