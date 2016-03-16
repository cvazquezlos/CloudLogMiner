/**
 * Created by silvia on 26/2/16.
 */

//Removed map.d import as no necessary
import {Injectable} from "angular2/core";
import {Http, Response, HTTP_PROVIDERS, Headers, RequestOptions, RequestMethod, Request} from 'angular2/http';

/*
 const ES_URL = 'http://127.0.0.1:9200/';
 const INDEX = "<logstash-*>";*/

const ES_URL = 'http://jenkins:jenkins130@elasticsearch.kurento.org:9200/';
const INDEX = "<kurento-*>";


@Injectable()
export class ElasticService {

    dataSource= {
        pageSize: 100,
        rowCount: -1,   //total number of rows unknown
        overflowSize: 10,
        //maxPagesInCache: 2, default is no limit
        maxConcurrentRequests: 2,
        getRows: this.scrollElastic.bind(this)

    };

    scrollId:string="";

    constructor(private _http: Http) {}

    listIndices() {
        return this._http.get('http://localhost:9200/_stats/index,store')
            .map(res=>res.json())
            .map(res => {
                return Object.getOwnPropertyNames(res.indices);
            });
    }

    private listAllLogs() {
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
                                {"range": {
                                        "@timestamp": {
                                            "gte": "now-200d",
                                            "lte": "now" }
                                    }
                                },
                                { "bool":{"should": [
                                        { "exists" : { "field" : "thread_name" } },
                                        { "exists" : { "field" : "threadid" } }
                                        ]
                                    }
                                },
                                { "bool": { "should": [
                                        { "exists" : { "field" : "logger_name" } },
                                        { "exists" : { "field" : "loggername" } }
                                        ]
                                    }
                                },
                                {   "bool": { "should": [
                                        { "exists" : { "field" : "loglevel" } },
                                        { "exists" : { "field" : "level" } }
                                        ]
                                    }
                                }
                            ]
                        }
                    }
                }
            },
            size: "50"
            //The following are the fields that are requested from each log. Should be consistent with the definition of logValue
            //_source: ["host", "thread_name", "logger_name", "message", "level", "@timestamp"] 
        };

        let requestoptions = new RequestOptions({
            method: RequestMethod.Post,
            url,
            body: JSON.stringify(body)
        });

        return this._http.request(new Request(requestoptions));
    }

    scrollElastic (params: any) {
        console.log('asking for ' + params.startRow + ' to ' + params.endRow);

        let size = params.endRow - params.startRow;

        if(!this.scrollId){
            let rowData=[];
            let rowsThisPage=this.listAllLogs().subscribe((res: Response) => {
                let data = res.json();

                let scrollid = data._scroll_id;
                this.scrollId = scrollid;

                for (let logEntry of data.hits.hits) {
                    let fullmessage:string = logEntry._source.message.replace('\n', '');

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
                console.log(rowData);
                params.successCallback(rowData.slice());
            });
            //params.successCallback(rowsThisPage.slice());
        }else {
            let body = {
                "scroll" : "1m",
                "scroll_id" : this.scrollId
            }
            let url = ES_URL + '/_search/scroll';
            let requestoptions = new RequestOptions({
                method: RequestMethod.Post,
                url,
                body: JSON.stringify(body)
            });
            let rowData=[];
            this._http.request(new Request(requestoptions)).subscribe((res:Response)=>{
                let data = res.json();

                let scrollid = data._scroll_id;
                this.scrollId = scrollid;

                for (let logEntry of data.hits.hits) {
                    let fullmessage:string = logEntry._source.message.replace('\n', '');

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
                let rowsThisPage=rowData.slice();
                //let lastRow=rowsThisPage.length;        //<- This is not java, length a property -not length()
                params.successCallback(rowsThisPage)//,lastRow);
                //params.failCallback()
            }, err=>console.log(err));
        }

    }

}
