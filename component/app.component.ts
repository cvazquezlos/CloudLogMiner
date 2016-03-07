import {Component} from 'angular2/core';
import {AgGridNg2} from 'ag-grid-ng2/main';
import {GridOptions} from 'ag-grid/main';

import {Http, Response, HTTP_PROVIDERS, Headers, RequestOptions, RequestMethod, Request} from 'angular2/http';

const ES_URL = 'http://127.0.0.1:9200/';
const INDEX = "<logstash-*>";
/*
const ES_URL = 'http://jenkins:jenkins130@elasticsearch.kurento.org:9200/';
const INDEX = "<kurento-*>";*/

@Component({
    selector: 'my-app',
    templateUrl: 'component/appcomponent.html',
    directives: [AgGridNg2],
    providers: HTTP_PROVIDERS,
    styles: ['.toolbar button {margin: 2px; padding: 0px;}'],
})
export class AppComponent {

    private gridOptions: GridOptions;
    private showGrid: boolean;
    private rowData: any[];
    private columnDefs: any[];
    private rowCount: string;

    constructor(private http: Http) {
        // we pass an empty gridOptions in, so we can grab the api out
        this.gridOptions = <GridOptions>{};
        this.rowData=[];
        this.createRowData();
        this.createColumnDefs();
        this.showGrid = true;
    }

    private createRowData() {

        let url =ES_URL + INDEX + '/_search?scroll=1m&filter_path=_scroll_id,hits.hits._source,hits.hits._type';
          let body= { 
              sort: [ 
                  { "@timestamp": "desc" } 
              ],
              query: {
                  "filtered": {
                      "filter": {
                          "bool": {
                              "must": [
                                  {
                                      "range": {
                                          "@timestamp": {
                                              "gte": "now-20d",
                                              "lte": "now"
                                          }
                                      }
                                  },
                                  {   "bool":
                                      {   "should": [
                                          {
                                              "exists" : { "field" : "thread_name" }
                                          },
                                          {
                                              "exists" : { "field" : "threadid" }
                                          }
                                      ]
                                      }
                                  },
                                  {   "bool":
                                      {   "should": [
                                          {
                                              "exists" : { "field" : "logger_name" }
                                          },
                                          {
                                              "exists" : { "field" : "loggername" }
                                          }
                                      ]
                                      }
                                  },
                                  {   "bool":
                                      {   "should": [
                                          {
                                              "exists" : { "field" : "loglevel" }
                                          },
                                          {
                                              "exists" : { "field" : "level" }
                                          }
                                      ]
                                      }
                                  }
                              ]

                          }
                      }
                  }
              }, 
              size: "50", 
              //The following are the fields that are requested from each log. Should be consistent with the definition of logValue
              //_source: ["host", "thread_name", "logger_name", "message", "level", "@timestamp"] 
          };

         let requestoptions = new RequestOptions({ 
             method: RequestMethod.Post, 
             url, 
             body: JSON.stringify(body) 
         });

        this.http.request(new Request(requestoptions)) 
            .subscribe((res: Response) => {
                let data = res.json();
                for (let logEntry of data.hits.hits) {
                    let fullmessage: string = logEntry._source.message.replace('\n', '');

                    let type = logEntry._type;
                    let time = logEntry._source['@timestamp'];
                    let message = logEntry._source.message;
                    let level = logEntry._source.level || logEntry._source.loglevel;
                    let thread = logEntry._source.thread_name || logEntry._source.threadid;
                    let logger = logEntry._source.logger_name || logEntry._source.loggername;
                    let host = logEntry._source.host;

                    let logValue = { type, time, message, level, thread, logger, host };
                    this.rowData.push(logValue);
                    this.gridOptions.api.setRowData(this.rowData);
                }
            });
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
        }

        this.columnDefs = [
            {
                headerName: '#', width: 30, checkboxSelection: false, suppressSorting: true,
                suppressMenu: true, pinned: true
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

function skillsCellRenderer(params) {
    let data = params.data;
    let skills = [];
    RefData.IT_SKILLS.forEach(function (skill) {
        if (data && data.skills && data.skills[skill]) {
            skills.push('<img src="/images/skills/' + skill + '.png" width="16px" title="' + skill + '" />');
        }
    });
    return skills.join(' ');
}
