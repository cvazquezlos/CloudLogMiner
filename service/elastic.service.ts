/**
 * Created by silvia on 26/2/16.
 */

//Removed map.d import as no necessary
import {Injectable} from "angular2/core";
import {Http, Response, HTTP_PROVIDERS, Headers, RequestOptions, RequestMethod, Request} from 'angular2/http';
import {EventEmitter} from "angular2/core";
import 'rxjs/add/operator/map'

/*
 const ES_URL = 'http://127.0.0.1:9200/';
 const INDEX = "<logstash-*>";*/

const ES_URL = 'http://jenkins:jenkins130@elasticsearch.kurento.org:9200/';
const INDEX = "<kurento-*>";


@Injectable()
export class ElasticService {


    scroll:{id:string,search:boolean}={id:"",search:false};         //Elasticsearch scroll indicator

    fields:{
        level:any,
        logger:any,
        thread:any
    }={
        level:"",
        logger:"",
        thread:""
    };

    private sizeOfPage:number = 100;

    private nResults:number = 0;

    private maxResults:number = 500;

    constructor(private _http: Http) {

    }

    private listIndices() {                     //Never used
        return this._http.get('http://localhost:9200/_stats/index,store')
            .map(res=>res.json())
            .map(res => {
                return Object.getOwnPropertyNames(res.indices);
            });
    }

    private listAllLogs(url:string, body:any) {
        let requestoptions = new RequestOptions({
            method: RequestMethod.Post,
            url,
            body: JSON.stringify(body)
        });

        return this._http.request(new Request(requestoptions))
            .map((responseData)=> { return responseData.json()})
            .map((answer)=>{
                let result: Array<any>=[];
                if(answer) {
                    for(let a of answer.hits.hits){
                        let b=this.elasticLogProcessing(a);
                        result.push(b);
                        this.nResults++;
                        if (this.nResults > this.maxResults) {
                            console.log("Reached max results=" + this.maxResults + ". Aborting log download");
                            return;
                        }
                    }
                }
                let id = answer._scroll_id;
                this.scroll.id = id;
                let url2 = ES_URL + '_search/scroll';

                let esquery = { scroll: '1m', scroll_id: id }

                this.listAllLogs(url2, esquery);

                return result;
            });
    }


    private scrollElastic () {
        let body = {
            "scroll" : "1m",
            "scroll_id" : this.scroll.id
        };
        let url = ES_URL + '_search/scroll';
        let requestoptions = new RequestOptions({
            method: RequestMethod.Post,
            url,
            body: JSON.stringify(body)
        });
        return this._http.request(new Request(requestoptions));

    }

    public getRowsDefault() {            //NOTE SCROLL ID! Elasticsearch scroll wouldn't work without it
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

        return this.listAllLogs(url,body);
    }

    private firstSearch(value:string, sizeOfPage:number) {
        this.scroll.search=true;
        let body = {
            "query":{
                "multi_match": {
                    "query":value,
                        "type":"best_fields",
                        "fields": ["type", "host", "message", this.fields.level, this.fields.logger, this.fields.thread],         //Not filter by time: parsing user input would be required
                        "tie_breaker":0.3,
                        "minimum_should_match":"30%"
                }
            },
            size:sizeOfPage,
            sort:[
                "_score"
            ]
        };
        let url = ES_URL + INDEX + '/_search?scroll=1m';
        let requestoptions = new RequestOptions({
            method: RequestMethod.Post,
            url,
            body: JSON.stringify(body)
        });
        return this._http.request(new Request(requestoptions));
    }

    public search(value:string, sizeOfPage:number){
        if(!(this.scroll.id && this.scroll.search)){
            return this.firstSearch(value,sizeOfPage);
        }else if (this.scroll.id && this.scroll.search){
            return this.scrollElastic();
        }
    }

    elasticLogProcessing(logEntry: json) {let type = logEntry._type;
        let time = logEntry._source['@timestamp'];
        let message = logEntry._source.message;
        let level = logEntry._source.level || logEntry._source.loglevel;
        if(logEntry._source.level){
            this.fields.level="level";
        }else{
            this.fields.level="loglevel";
        }
        let thread = logEntry._source.thread_name || logEntry._source.threadid;
        if(logEntry._source.thread_name){
            this.fields.thread="thread_name";
        }else{
            this.fields.thread="threadid";
        }
        let logger = logEntry._source.logger_name || logEntry._source.loggername;
        if(logEntry._source.logger_name){
            this.fields.logger="logger_name";
        }else{
            this.fields.logger="loggername";
        }
        let host = logEntry._source.host;

        let logValue = {type, time, message, level, thread, logger, host};

        return logValue;
    }
}
