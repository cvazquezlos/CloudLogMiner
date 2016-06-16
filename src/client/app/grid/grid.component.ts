/**
 * Created by silvia on 26/2/16.
 */
import {Component} from '@angular/core';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions} from 'ag-grid/main';
import {toInputLiteral} from '../shared/utils/DateUtils';
import {ElasticService, FilesTree, Directory, getDirectories, RowDisplay} from "../shared/index";

/*@Component({
 moduleId: module.id,
 selector: 'my-app',
 templateUrl: 'grid.component.html',
 directives: [AgGridNg2, FilesTree],
 styles: ['.toolbar button {margin: 2px; padding: 0px;}'],
 })*/
@Component({
    moduleId: module.id,
    selector: 'sd-grid',
    templateUrl: 'grid.component.html',
    directives: [FilesTree, AgGridNg2, RowDisplay]
})
export class GridComponent {

    public gridOptions:GridOptions;
    private showGrid:boolean;
    public rowData:any[];
    private columnDefs:any[];
    private rowCount:string;

    private showLoadMore:boolean;
    private showLoadEarlier:boolean;
    private earliestDate:Date;

    private searchByRelevance:boolean;
    public currentFilter:string;
    public errorMessages:Array<{text:string, type:string}>;
    public directories:Array<Directory>;

    private defaultFrom = new Date(new Date().valueOf() - (10 * 60 * 60 * 1000));
    private defaultTo = new Date(new Date().valueOf() - (1 * 60 * 60 * 1000));

    private treeHidden = false;

    private rowSelected = {};

    /**
     * Creates an instance of the GridCompoenent with the injected
     * ElasticService.
     *
     * @param {ElasticService} elasticService - The injected ElasticService.
     */
    constructor(private _elasticService:ElasticService) {
        this.showLoadMore = false;
        this.showLoadEarlier = false;
        this.earliestDate = new Date(0);
        // we pass an empty gridOptions in, so we can grab the api out
        this.gridOptions = <GridOptions>{
            //enableServerSideSorting: true
        };
        //this.rowData=[];
        this.createColumnDefs();
        this.showGrid = true;
        this.searchByRelevance = false;
        this.errorMessages = [];
    }

    ngAfterContentInit() {         //It needs to be done after the grid api has been set, to be able to use its methods
        this.createRowData();
    }

    public createRowData() {
        //this.gridOptions.api.showLoadingOverlay();
        this.rowData = [];
        this._elasticService.getRowsDefault()
            .subscribe(
                (res)=> {
                    //this.gridOptions.api.hideOverlay(); TODO it breaks the test
                    this.rowData = this.rowData.concat(res);
                    this.rowData = this.rowData.slice();
                },
                (err)=> {
                    this.subscribeError("Error when default fetching. " + err)
                },
                (complete) => {
                    this.subscribeComplete();
                    this.errorMessages = [];  //we restart messages
                });
    }

    public search(input:string) {
        this.gridOptions.api.showLoadingOverlay();
        this.rowData = [];                //RESTART ROW DATA or it will be appended after default rows
        this._elasticService.search(input, this.searchByRelevance).subscribe((res)=> {
                this.gridOptions.api.hideOverlay();
                this.rowData = this.rowData.concat(res);
                this.rowData = this.rowData.slice();
            }, (err)=> this.subscribeError("Error when searching. " + err),
            (complete) => this.subscribeComplete());
    }

    public mark(input:string) {
        let i = 0;
        for (let row of this.rowData) {
            for (let field in row) {
                if (row.hasOwnProperty(field) && field != "marked") {        //Check that property doesn't belong to prototype & boolean cannot be searched
                    if (row[field].toLowerCase().indexOf(input.toLowerCase()) != -1) {
                        this.rowData[i].marked = true;
                        break;
                    } else {
                        this.rowData[i].marked = false;
                    }
                }
            }
            i++;
        }
        this.currentFilter = input;
        this.gridOptions.api.refreshView();
    }

    public loadByDate(to:Date, from:Date) {
        if (from < to) {
            this.gridOptions.api.showLoadingOverlay();
            this.rowData = [];
            this._elasticService.loadByDate(to, from, false, false).subscribe((res) => {
                    this.gridOptions.api.hideOverlay();
                    this.rowData = this.rowData.concat(res);
                    this.rowData = this.rowData.slice();

                }, (err)=> this.subscribeError("Error when loading by date. " + err),
                (complete) => {
                    this.setErrorAlert("INFO: From now on logs will exclusively be fetched between the selected dates", "info");
                    this.subscribeComplete()
                });
        } else {
            this.setErrorAlert("Please enter a valid date", "error");
        }
    }

    public loadMore(loadLater:boolean) {
        this.gridOptions.api.showLoadingOverlay();
        let r = this.rowCount.split("/");           //Number of displayed logs comes from the grid
        let lastLog = this.rowData[parseInt(r[0]) - 1];

        let log = {};
        if (loadLater) {
            log = lastLog;
        } else {
            log = this.rowData[0];
        }

        this._elasticService.loadMore(log, loadLater).subscribe((res) => {   //load earlier: true, load later: false
                this.gridOptions.api.hideOverlay();
                if (loadLater) {
                    this.rowData = this.rowData.concat(res);
                } else {
                    this.rowData = res.concat(this.rowData);
                }

                this.rowData = this.rowData.slice();
            }, (err)=> this.subscribeError("Error when further fetching"),
            (complete) => this.subscribeComplete());
    }


    public getDirectories() {
        return getDirectories(this.rowData);
    }

    private dirChecked(dir: string) {
        this.rowData = [];
        this._elasticService.loadByFile(dir).subscribe((res) => {
            this.gridOptions.api.hideOverlay();
            this.rowData = this.rowData.concat(res);
            this.rowData = this.rowData.slice();

        }, (err) => this.subscribeError("Error when checking source files"),
        (complete) => {
            this.setErrorAlert("INFO: From now on logs will exclusively be fetched from selected files", "info");
            this.subscribeComplete();
        });
    }

    private dirUnchecked(dir) {
        this.rowData = [];
        this.gridOptions.api.showLoadingOverlay();
        this._elasticService.removeFileState().subscribe((res) => {     //returns actual request without file filter
                this.gridOptions.api.hideOverlay();
                this.rowData = this.rowData.concat(res);
                this.rowData = this.rowData.slice();
            }, (err)=> this.subscribeError("Error when unchecking source files"),
            (complete) => this.subscribeComplete());
        this.removeErrorAlert("files");
    }

    private subscribeComplete() {
        console.log("Done");
        //Need to apply the marker
        if (this.currentFilter) {
            this.mark(this.currentFilter);
        }
        if (this.rowData.length > 49) {
            this.showLoadMore = true;
        }

        let i =0;
        let newArray = this.errorMessages;
        for(let msg of this.errorMessages) {
            if (msg.type && (msg.type.indexOf("info") === -1)) {     //errors have been bypassed
                if(newArray.indexOf(msg) > -1) {
                    newArray.splice(newArray.indexOf(msg), 1);
                }
            }
            i++;
        }
        this.errorMessages = newArray;

        this.directories = this.getDirectories();

        if (this.rowData) {
            let firstTime = this.rowData[0].time || this.rowData[0]["@timestamp"];
            this.earliestDate = this.earliestDate > firstTime ? this.earliestDate : firstTime;

            if (this.earliestDate !== firstTime) {
                this.showLoadEarlier = true;
            }
        }

    }

    private subscribeError(err:string) {
        this.setErrorAlert(err, "error");
    }


    public createColumnDefs() {
        let logLevel = (params) => {
            if (params.data.level === 'ERROR') {
                return 'log-level-error '
            } else if (params.data.level === 'WARN') {
                return 'log-level-warn '
            } else {
                return '';
            }
        };

        let marked = (params) => {
            if (params.data.marked) {
                return 'markedInFilter'
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
                cellClass: (params) => {
                    return [logLevel(params), marked(params)]
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

    public toggleTree(newState) {
        this.treeHidden = newState;
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
        let row = $event.node.data;
        let keys = Object.keys(row);
        this.rowSelected = {data: row, keys};
        window.scrollTo(0, document.body.scrollHeight || document.documentElement.scrollHeight);
    }


// here we use one generic event to handle all the column type events.
// the method just prints the event name
    public onColumnEvent($event) {
        console.log('onColumnEvent: ' + $event);
    }

// AUX METHODS ------------------------------
    getDefaultFromValue() {
        return toInputLiteral(this.defaultFrom);
    }

    getDefaultToValue() {
        return toInputLiteral(this.defaultTo);
    }

    private setErrorAlert(message:string, type:string) {
        if (type === "error") {
            type = "danger";
        }
        this.errorMessages.push({
            text: message,
            type: "alert-" + type + " alert fade in alert-dismissible"
        });

    }

    private removeErrorAlert(msgcontains: string) {
        for(let msg of this.errorMessages) {
            if (msg.type.indexOf(msgcontains) === -1) {     //errors have been bypassed
                msg.text = "";
            }
        }
    }
}
