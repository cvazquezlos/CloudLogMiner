/**
 * Created by silvia on 26/2/16.
 */

//Removed map.d import as no necessary
import {Injectable,EventEmitter} from "angular2/core";
import {Http, Response, HTTP_PROVIDERS, Headers, RequestOptions, RequestMethod, Request} from 'angular2/http';
import 'rxjs/add/operator/map';


 const ES_URL = 'http://127.0.0.1:9200/';
 const INDEX = "<logstash-*>";
/*
const ES_URL = 'http://jenkins:jenkins130@elasticsearch.kurento.org:9200/';
const INDEX = "<kurento-*>";*/


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

    private sizeOfPage:number = 10;

    private nResults:number = 0;

    private maxResults:number = 50;

    private currentRequest:RequestOptions = new RequestOptions();

    constructor(private _http: Http) {

    }

    public listIndices() {                     //Never used
        return this._http.get('http://localhost:9200/_stats/index,store')
            .map(res=>res.json())
            .map(res => {
                return Object.getOwnPropertyNames(res.indices);
            });
    }

    public listAllLogs(requestOptions:any, emitter):any {

        this._http.request(new Request(requestOptions))
            .map((responseData)=> { return responseData.json()})        //Important include 'return' keyword
            .map((answer)=> {
                let id = answer._scroll_id;
                this.scroll.id = id;            //id has to be assigned before mapLogs, which only returns the hits.
                answer=this.mapLogs(answer);
                return answer;
            })
            .subscribe(batch=> {
                this.nResults=this.nResults+this.sizeOfPage;
                emitter.emit(batch);
                if(this.nResults<this.maxResults){
                    let body2 = {
                        "scroll" : "1m",
                        "scroll_id" : this.scroll.id
                    };
                    let url2 = ES_URL + '_search/scroll';
                    let requestOptions2 = new RequestOptions({
                        method: RequestMethod.Post,
                        url: url2,
                        body: JSON.stringify(body2)
                    });
                    this.listAllLogs(requestOptions2, emitter);
                    return;
                }else {
                    this.nResults=0;
                    emitter.complete();
                }

            });

        return;
    }

    public getRowsDefault() {            //NOTE SCROLL ID! Elasticsearch scroll wouldn't work without it
        let url =ES_URL + INDEX + '/_search?scroll=1m&filter_path=_scroll_id,hits.hits._source,hits.hits._type';
        let body= {
            sort: [
                { "@timestamp": "desc" }
            ],
            query: {
                filtered: {
                    filter: {
                        bool: {
                            must: [
                                {range: {
                                    '@timestamp': {
                                        gte: "now-200d",
                                        lte: "now" }
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
        let requestOptions = new RequestOptions({
            method: RequestMethod.Post,
            url,
            body: JSON.stringify(body)
        });
        this.currentRequest = requestOptions;
        console.log(requestOptions);

        let results: EventEmitter<any> = new EventEmitter<any>();
        this.listAllLogs(requestOptions, results);
        return results;
    }


    public search(value:string){
        let searchEmitter: EventEmitter<any> = new EventEmitter<any>();
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
            size:this.sizeOfPage,
            sort:[
                "_score"
            ]
        };
        let url = ES_URL + INDEX + '/_search?scroll=1m';
        let requestOptions2 = new RequestOptions({
            method: RequestMethod.Post,
            url,
            body: JSON.stringify(body)
        });
        this.currentRequest = requestOptions2;

        this.listAllLogs(requestOptions2, searchEmitter);
        return searchEmitter;
    }

    loadMore(lastLog: any) {
        let loadMoreEmitter:EventEmitter<any> = new EventEmitter<any>();
        let lastTime = lastLog.time;
        let newBody = JSON.parse(this.currentRequest.body);
        let lessThan:Date = new Date(lastTime);
        let greaterThan:Date = new Date(lastTime);
        greaterThan.setDate(greaterThan.getDate() - 20);
        newBody.query.filtered.filter.bool.must[0].range["@timestamp"] = {
            "gte": greaterThan.toISOString(),
            "lte": lessThan.toISOString()
        };
        if (!(JSON.parse(this.currentRequest.body).query.filtered.filter.bool.must[0].range["@timestamp"].gte === greaterThan.toISOString())) {
            this.currentRequest.body = JSON.stringify(newBody);
            let auxEmitter: EventEmitter<any> = new EventEmitter<any>();
            this.listAllLogs(this.currentRequest, auxEmitter);
            auxEmitter.subscribe(logs => {
                loadMoreEmitter.emit(logs);
            });
        } else {
            console.log ("No more results to fetch");
            loadMoreEmitter.complete()
        }
        return loadMoreEmitter;
    }

    mapLogs(answer): any[] {
        let result: any[]=[];
        if(answer) {
            for(let a of answer.hits.hits){
                let b=this.elasticLogProcessing(a);
                result.push(b);
            }
        }
        return result;
    }

    elasticLogProcessing(logEntry: any) {let type = logEntry._type;
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
