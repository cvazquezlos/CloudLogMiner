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
    private searchByRelevance: boolean;

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
        this.searchByRelevance=false;
    }

    public createRowData(){
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

    public search(input:string) {
        //this.gridOptions.api.showLoadingOverlay();
        this.rowData=[];                //RESTART ROW DATA or it will be appended after default rows
        this._elasticService.search(input, this.searchByRelevance).subscribe((res)=>{
            this.gridOptions.api.hideOverlay();
            this.rowData=this.rowData.concat(res);
            this.rowData=this.rowData.slice();
        }, (err)=>console.log("Error in search"+err),
            (complete)=>{
                console.log("Done");
                this.showLoadMore = true;
            });

    }

    public loadMore() {
        let r = this.rowCount.split("/");
        let lastLog = this.rowData[parseInt(r[0])-1];
        this._elasticService.loadMore(lastLog).subscribe((res)=>{
            this.gridOptions.api.hideOverlay();
            this.rowData=this.rowData.concat(res);
            this.rowData=this.rowData.slice();
        }, (err)=>console.log("Error in further fetching"+err),
            (complete)=>{
                console.log("Done");
                this.showLoadMore = false;
            });
    }

    public createColumnDefs() {
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

    public onModelUpdated() {
        console.log('onModelUpdated');
        this.calculateRowCount();
    }

    public onReady() {
        console.log('onReady');
        this.calculateRowCount();
    }

    public onCellClicked($event) {
        console.log('onCellClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
    }

    public onCellValueChanged($event) {
        console.log('onCellValueChanged: ' + $event.oldValue + ' to ' + $event.newValue);
    }

    public onCellDoubleClicked($event) {
        console.log('onCellDoubleClicked: ' + $event.rowIndex + ' ' + $event.colDef.field);
    }

    public onCellContextMenu($event) {
        console.log('onCellContextMenu: ' + $event.rowIndex + ' ' + $event.colDef.field);
    }

    public onCellFocused($event) {
        console.log('onCellFocused: (' + $event.rowIndex + ',' + $event.colIndex + ')');
    }

    public onRowSelected($event) {
        console.log('onRowSelected: ' + $event.node.data.name);
    }

    public onSelectionChanged() {
        console.log('selectionChanged');
    }

    public onBeforeFilterChanged() {
        console.log('beforeFilterChanged');
    }

    public onAfterFilterChanged() {
        console.log('afterFilterChanged');
    }

    public onFilterModified() {
        console.log('onFilterModified');
    }

    public onBeforeSortChanged() {
        console.log('onBeforeSortChanged');
    }

    public onAfterSortChanged() {
        console.log('onAfterSortChanged');
    }

    public onVirtualRowRemoved($event) {
        // because this event gets fired LOTS of times, we don't print it to the
        // console. if you want to see it, just uncomment out this line
        // console.log('onVirtualRowRemoved: ' + $event.rowIndex);
    }

    public onRowClicked($event) {
        console.log('onRowClicked: ' + $event.node.data.time);
    }


    // here we use one generic event to handle all the column type events.
    // the method just prints the event name
    public onColumnEvent($event) {
        console.log('onColumnEvent: ' + $event);
    }

}

