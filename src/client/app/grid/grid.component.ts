/**
 * Created by silvia on 26/2/16.
 */
import {Component} from '@angular/core';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions} from 'ag-grid/main';
import {toInputLiteral} from '../shared/utils/DateUtils';
import {ElasticService, FilesTree, Directory, getDirectories, RowDisplay} from "../shared/index";

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
    public errorMessage: {text:string, type:string};
    public directories:Array<Directory>;

    private defaultFrom = new Date(new Date().valueOf() - (10 * 60 * 60 * 1000));
    private defaultTo = new Date(new Date().valueOf() - (1 * 60 * 60 * 1000));
    public inputTo;
    public inputFrom;

    private treeHidden = false;

    private rowSelected = {};

    private currentlyChecked = [];

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
        this.errorMessage = {text:"", type:""};
        this.inputTo = this.parseDate(this.defaultTo);
        this.inputFrom = this.parseDate(this.defaultFrom);
    }

    ngAfterContentInit() {         //It needs to be done after the grid api has been set, to be able to use its methods
        this.createRowData();
    }

    public createRowData(clear = false) {
        //this.gridOptions.api.showLoadingOverlay();
        this.rowData = [];
        this._elasticService.getRowsDefault()
            .subscribe(
                (res)=> {
                    //this.gridOptions.api.hideOverlay(); TODO it breaks the test
                    this.rowData = this.rowData.concat(res);
                    if(clear) {
                        for(let f of this.rowData) {
                            f.marked = false;
                        }
                    }
                    this.rowData = this.rowData.slice();
                },
                (err)=> {
                    this.subscribeError("Error when default fetching. " + err)
                },
                (complete) => {
                    this.subscribeComplete(true, false, false, true);
                    this.errorMessage = {text:"", type:""};  //we restart messages
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

    public loadByDate(from:Date, to:Date) {
        this.rowData = [];                //RESTART ROW DATA or it will be appended after default rows
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
            this.setErrorAlert("Please enter a valid date and try again", "error");
        }
    }

    public generalSearch(from, to, searchinput) {
        this.rowData = [];                //RESTART ROW DATA or it will be appended after default rows
        if(!searchinput) {
            this.loadByDate(from, to)
        } else {
            if (from < to) {
                this._elasticService.generalSearch(to, from, searchinput, this.searchByRelevance).subscribe((res) => {
                        this.gridOptions.api.hideOverlay();
                        this.rowData = this.rowData.concat(res);
                        this.rowData = this.rowData.slice();

                    }, (err)=> this.subscribeError("Error when loading by date and input. " + err),
                    (complete) => {
                        this.setErrorAlert("INFO: From now on logs will exclusively be fetched between the selected dates", "info");
                        this.subscribeComplete()
                    });
            }else {
                this.setErrorAlert("Please enter a valid date and try again", "error");
            }
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

            if (!loadLater) {
                this.rowData = res.concat(this.rowData);
            } else {
                this.rowData = this.rowData.concat(res);
            }

            this.rowData = this.rowData.slice();
            }, (err)=> this.subscribeError("Error when further fetching"),
            (complete) => {
                let r;
                if(loadLater) {
                    r = this.rowData[this.rowData.length -1];
                } else {
                    r = this.rowData[0];
                }
                if((log.message === r.message)&&(log[this._elasticService.isTimestampField]===r[this._elasticService.isTimestampField])) {
                    //There were no more logs to fetch
                    if(loadLater) {
                        this.showLoadEarlier = false;
                        this.subscribeComplete(true, true, false);
                    } else {
                        this.showLoadMore = false;
                        this.subscribeComplete(true, false, true);
                    }
                }
            });
    }


    public getDirectories() {
        return getDirectories(this.rowData);
    }

    private dirChecked(dir: string) {
        this.currentlyChecked.push(dir);

        this.rowData = [];
        this._elasticService.loadByFile(dir).subscribe((res) => {
            this.gridOptions.api.hideOverlay();
            this.rowData = this.rowData.concat(res);
            this.rowData = this.rowData.slice();

        }, (err) => this.subscribeError("Error when checking source files"),
        (complete) => {
            this.setErrorAlert("INFO: From now on logs will exclusively be fetched from selected files", "info");
            this.subscribeComplete(false);
        });
    }

    private dirUnchecked(dir) {
        this.currentlyChecked.splice(this.currentlyChecked.indexOf(dir), 1);

        this.rowData = [];
        this.gridOptions.api.showLoadingOverlay();
        this._elasticService.removeFileState(dir).subscribe((res) => {     //returns actual request without file filter
                this.gridOptions.api.hideOverlay();
                this.rowData = this.rowData.concat(res);
                this.rowData = this.rowData.slice();
            }, (err)=> this.subscribeError("Error when unchecking source files"),
            (complete) => this.subscribeComplete(false));
    }

    private subscribeComplete(refreshDirectories: boolean = true, loadearlier=false, loadlater=false, isClearFilters = false) {
        console.log("Done");
        //Need to apply the marker
        if (this.currentFilter && !isClearFilters) {
            this.mark(this.currentFilter);
        }
        if(isClearFilters) {
            this.currentFilter = "";
        }

        if (!loadlater) {
            this.showLoadMore = true;
        }

        if(refreshDirectories) {
            this.directories = this.getDirectories();
        }

        if (this.rowData.length>0) {
            let firstTime = this.rowData[0].time || this.rowData[0][this._elasticService.isTimestampField];
            this.earliestDate = this.earliestDate > firstTime ? this.earliestDate : firstTime;

            if (this.earliestDate !== this.rowData[this.rowData.length - 1][this._elasticService.isTimestampField] && !loadearlier) {
                this.showLoadEarlier = true;
            }

            //set date inputs to current dates to respect service state
            let dat = new Date(firstTime);
            dat.setDate(dat.getDate() - 1);     //substract one day
            this.inputFrom = this.parseDate(dat);
            let lastTime = this.rowData[this.rowData.length-1].time || this.rowData[this.rowData.length-1][this._elasticService.isTimestampField];
            this.inputTo = this.parseDate(new Date(lastTime));
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

        this.columnDefs = [];
        for (let field of this._elasticService.fields) {
            let column = {
                headerName: field,
                field: field,
                pinned: false,
                volatile: true
            };
            if (field.indexOf("level") > -1) {
                column.cellClass = (params) => {
                    return [logLevel(params), marked(params)]
                }
            } else {
                column.cellClass = marked;
            }
            this.columnDefs.push(column);
        }
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
    parseDate(date) {
        return toInputLiteral(date);
    }

    private setErrorAlert(message:string, type:string) {
        if (type === "error") {
            type = "danger";
        }
        this.errorMessage = {
            text: message,
            type: "alert-" + type + " alert fade in alert-dismissible"
        };

        setTimeout(() => {
            this.errorMessage = {text:"", type:""};
        }, 10000);

    }
}
