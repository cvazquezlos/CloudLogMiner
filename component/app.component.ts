import {Component} from 'angular2/core';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions} from 'ag-grid/main';
import {Http, Response, HTTP_PROVIDERS, Headers, RequestOptions, RequestMethod, Request} from 'angular2/http';
import {ElasticService} from "../service/elastic.service";

@Component({
    selector: 'my-app',
    templateUrl: 'component/appcomponent.html',
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

    private sizeOfPage=100;     //has to be consistent with http call and datasource

    dataSource= {
        pageSize: this.sizeOfPage,
        rowCount: -1,   //total number of rows unknown
        overflowSize: 4,
        //maxPagesInCache: 2, default is no limit
        maxConcurrentRequests: 2,
        getRows: this.getRows.bind(this)      //Grid will dinamically use this function to retrieve data

    };

    constructor(private _elasticService:ElasticService) {
        // we pass an empty gridOptions in, so we can grab the api out
        this.gridOptions = <GridOptions>{};
        this.gridOptions.virtualPaging = true;
        this.gridOptions.datasource = this.dataSource;
        this.rowData=[];
        //this.createRowData();  -- UPDATED WITH VIRTUAL PAGING
        this.createColumnDefs();
        this.showGrid = true;
    }

    private getRows(params:any){
        this.gridOptions.api.showLoadingOverlay();
        if(!this._elasticService.scrollId){
            this._elasticService.listAllLogs(this.sizeOfPage).subscribe((res: Response) => {
                
                let data = this.elasticLogProcessing(res);
                this.gridOptions.api.hideOverlay();
                params.successCallback(data.slice());
            });
        }else{
            this._elasticService.scrollElastic().subscribe((res:Response)=>{

                let data2 = this.elasticLogProcessing(res);
                this.gridOptions.api.hideOverlay();
                params.successCallback(data2.slice());
            });
        }
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
    }

    private calculateRowCount() {
        if (this.gridOptions.api && this.rowData) {
            let model = this.gridOptions.api.getModel();
            let totalRows = this.rowData.length;
            let processedRows = model.getVirtualRowCount();
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

    private onQuickFilterChanged($event) {
        this.gridOptions.api.setQuickFilter($event.target.value);
    }

    // here we use one generic event to handle all the column type events.
    // the method just prints the event name
    private onColumnEvent($event) {
        console.log('onColumnEvent: ' + $event);
    }

    elasticLogProcessing(res: Response) {
        let rowData=[];
        let data = res.json();

        let id = data._scroll_id;
        this.scrollId = id;

        for (let logEntry of data.hits.hits) {

            let type = logEntry._type;
            let time = logEntry._source['@timestamp'];
            let message = logEntry._source.message;
            let level = logEntry._source.level || logEntry._source.loglevel;
            let thread = logEntry._source.thread_name || logEntry._source.threadid;
            let logger = logEntry._source.logger_name || logEntry._source.loggername;
            let host = logEntry._source.host;

            let logValue = {type, time, message, level, thread, logger, host};

            rowData.push(logValue);
        }
        return rowData;
    }

}
