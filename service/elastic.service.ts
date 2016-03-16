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
    sizeOfPage=100;     //has to be consistent with http call and datasource

    dataSource= {
        pageSize: this.sizeOfPage,
        rowCount: -1,   //total number of rows unknown
        overflowSize: 4,
        //maxPagesInCache: 2, default is no limit
        maxConcurrentRequests: 2,
        getRows: this.scrollElastic.bind(this)      //Grid will dinamically use this function to retrieve data

    };

    scrollId:string="";         //Elasticsearch scroll indicator

    constructor(private _http: Http) {

    }

    private listIndices() {                     //Unused
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
            size: this.sizeOfPage
            //The following are the fields that are requested from each log. They should be consistent with the definition of logValue
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

        if(!this.scrollId){
            this.listAllLogs().subscribe((res: Response) => {

                let data = this.elasticLogProcessing(res);
                params.successCallback(data.slice());
            });
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
            this._http.request(new Request(requestoptions)).subscribe((res:Response)=>{

                let data2 = this.elasticLogProcessing(res);
                params.successCallback(data2.slice());
                //params.failCallback()
            }, err=>console.log(err));
        }

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
