/**
 * Created by silvia on 26/2/16.
 */

//Removed map.d import as no necessary
import {Injectable,EventEmitter} from "@angular/core";
import {Http, RequestOptions, RequestMethod, Request} from '@angular/http';
import 'rxjs/add/operator/map';
import {Observable} from "rxjs/Observable";


 const ES_URL = 'http://127.0.0.1:9200/';
 const INDEX = "<logstash-*>";

/*
const ES_URL = 'http://jenkins:jenkins130@elasticsearch.kurento.org:9200/';
const INDEX = "<kurento-*>";
 */
 const MORE_DAYS = 200;     //Days to add when a loadMore request


@Injectable()
export class ElasticService {


    scroll:string = "";         //Elasticsearch scroll indicator

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

    private currentRequest:RequestOptions;

    private state: {filesFilter: any, dateFilter: any} = {filesFilter:"", dateFilter: ""};



    constructor(private _http: Http) {

    }

    public listIndices() {                     //Never used
        return this._http.get('http://localhost:9200/_stats/index,store')
            .map(res=>res.json())
            .map(res => {
                return Object.getOwnPropertyNames(res.indices);
            });
    }

    public requestWithState(requestOptions:any, emitter) {
      //Check state
        let actualbody = JSON.parse(requestOptions.body);
        let dateFilterHappenedBefore = false;
        let fileFilterHappenedBefore = false;

        if (this.state.filesFilter || this.state.dateFilter) {
            let itHappenedBefore = false;
                if (actualbody.query.bool) {
                    let i = 0;
                    for (let musts of actualbody.query.bool.must) {
                        if (musts.range && this.state.dateFilter) {             //check if loadByDate has already happened in current request
                          actualbody.query.bool.must[i].range = this.state.dateFilter.range;
                          dateFilterHappenedBefore = true;
                        } else if (musts['query_string'] && this.state.filesFilter) {
                          actualbody.query.bool.must[i]['query_string'] = this.state.filesFilter['query_string'];
                          fileFilterHappenedBefore = true;
                        }
                        i++;

                    }
                }

                if (this.state.dateFilter && !dateFilterHappenedBefore) {
                    let futuremust;
                    if(actualbody.query.bool && actualbody.query.bool.must) {
                        futuremust = actualbody.query.bool.must;
                        futuremust.push(this.state.dateFilter);
                    } else {
                        futuremust = [actualbody.query, this.state.dateFilter];
                    }
                    actualbody.query = {
                        bool: {
                          must:
                          futuremust
                        }
                    };
                } else if (this.state.filesFilter && !fileFilterHappenedBefore) {
                    let futuremust;
                    if (actualbody.query.bool && actualbody.query.bool.must) {
                      futuremust = actualbody.query.bool.must;
                      futuremust.push(this.state.filesFilter);
                    } else {
                      futuremust = [actualbody.query, this.state.filesFilter];
                    }
                    actualbody.query = {
                      bool: {
                        must: futuremust
                      }
                    };
                }
            requestOptions.body = JSON.stringify(actualbody);
        }

        this.listAllLogs(requestOptions, emitter);
    }

    public listAllLogs(requestOptions:any, emitter): void {

        this._http.request(new Request(requestOptions))
            .map((responseData)=> { return responseData.json()})        //Important include 'return' keyword
            .map((answer)=> {
                let id = answer._scroll_id;
                this.scroll = id;                //id has to be assigned before mapLogs, which only returns the hits.
                answer=this.mapLogs(answer);
                return answer;
            })
            .subscribe(batch=> {
                this.nResults=this.nResults+this.sizeOfPage;
                emitter.next(batch);
                if(this.nResults<this.maxResults && batch.length==this.sizeOfPage){         //if length is less than size of page there is no need for a scroll
                    let body2 = {
                        "scroll" : "1m",
                        "scroll_id" : this.scroll
                    };
                    let url2 = ES_URL + '_search/scroll';
                    let requestOptions2 = this.wrapRequestOptions(url2, body2);
                    this.listAllLogs(requestOptions2, emitter);
                    return;
                }else {
                    this.nResults=0;
                    emitter.complete();
                }

            }, err => { if(err.status===200){
                    emitter.error(new Error("Can't access elasticSearch instance (ERR_CONNECTION_REFUSED)"))
                } }
            );

        return;
    }

    public getRowsDefault() {            //NOTE SCROLL ID! Elasticsearch scroll wouldn't work without it
        let url =ES_URL + INDEX + '/_search?scroll=1m&filter_path=_scroll_id,hits.hits._source,hits.hits._type';
        let body= {
        sort: [
                { "@timestamp": "desc" }
            ],
            query: {
                bool: {
                    must: [
                        {range: {
                            '@timestamp': {
                                gte: "now-200d",
                                lte: "now" }
                        }
                        },
                        {
                            filtered: {
                                filter: {
                                    bool: {
                                        must: [
                                            {
                                                "bool": {
                                                    "should": [
                                                        {"exists": {"field": "thread_name"}},
                                                        {"exists": {"field": "threadid"}}
                                                    ]
                                                }
                                            },
                                            {
                                                "bool": {
                                                    "should": [
                                                        {"exists": {"field": "logger_name"}},
                                                        {"exists": {"field": "loggername"}}
                                                    ]
                                                }
                                            },
                                            {
                                                "bool": {
                                                    "should": [
                                                        {"exists": {"field": "loglevel"}},
                                                        {"exists": {"field": "level"}}
                                                    ]
                                                }
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    ]
                }
            },
            size: this.sizeOfPage
            //The following are the fields that are requested from each log. They should be consistent with the definition of logValue
            //_source: ["host", "thread_name", "logger_name", "message", "level", "@timestamp"] 
        };
        let requestOptions = this.wrapRequestOptions(url,body);
        this.currentRequest = requestOptions;

        //IMPORTANT RESTART STATE WHEN REFRESHING DATA
        this.state.dateFilter = "";
        this.state.filesFilter = "";

        let observable = Observable.create((observer) => this.listAllLogs(requestOptions, observer));

        return observable;
    }


    public search(value:string, orderByRelevance: boolean) {
        let sort;
        if(orderByRelevance) {
            let options1 = "_score";
            sort = [options1]
        }else{
             let options2 = { '@timestamp': 'desc'};
            sort = [options2];
        }
        let body = {
            "query":{
                "multi_match": {
                    "query":value,
                    "type":"best_fields",
                    "fields": ["type", "host", "message", this.fields.level, this.fields.logger, this.fields.thread, "path"],         //Not filter by time: parsing user input would be required
                    "tie_breaker":0.3,
                    "minimum_should_match":"30%"
                }
            },
            size:this.sizeOfPage,
            sort:
                sort

        };
        let url = ES_URL + INDEX + '/_search?scroll=1m';

        let requestOptions2 = this.wrapRequestOptions(url,body);
        if (!orderByRelevance) {            //Fetching more as it is implemented now uses timestamp of the older log
            this.currentRequest = requestOptions2;
        } else {
            this.currentRequest = null;
        }
        let observable = Observable.create((observer) =>
            this.requestWithState(requestOptions2, observer));

        return observable;
    }


    loadMore(lastLog: any, loadLater: boolean){
        if(this.currentRequest) {
            let logTime = lastLog.time || lastLog._source["@timestamp"];
            let lessThan, greaterThan;
            let changeStateGreater;
            if(loadLater) {
              lessThan = logTime;
              greaterThan = logTime+"||-"+MORE_DAYS+"d"; //"Date Math starts with an anchor date, which can either be now, or a date string ending with ||. (ElasticSearch)"
              changeStateGreater = true;
            } else {
              lessThan = logTime+"||+"+MORE_DAYS+"d";
              greaterThan = logTime;
              changeStateGreater = false;
            }

            return this.loadByDate(lessThan, greaterThan, true, changeStateGreater);
        } else {
            return Observable.create((ob) => {ob.complete()});
        }
    }

    loadByDate(lessThan, greaterThan, isLoadMore, greaterOrLesser) {
        let oldRequestGreaterThan;
        let notSupported = false;
        let newBody;
        if(this.currentRequest) {
            newBody = JSON.parse(this.currentRequest.body);

            let addition = {
                range: {
                    "@timestamp": {
                        "gte": greaterThan,
                        "lte": lessThan
                    }
                }
            };


            if(isLoadMore && this.state.dateFilter) {    //we will need to update state.dateFilter
                let filterTime = this.state.dateFilter.range["@timestamp"];
                if(greaterOrLesser) {
                    filterTime.gte = greaterThan;   //we do not touch less than: it's the original one before load more
                } else {
                    filterTime.lte = lessThan;         //same for the opposite
                }
            } else {
                this.state.dateFilter = addition;   //We do not worry about the orignal state as we overwrite it
            }

            let itHappenedBefore = false;
            if(newBody.query.bool) {
                let i = 0;
                for(let musts of newBody.query.bool.must) {
                    if(musts.range) {             //check if loadByDate has already happened in current request
                        newBody.query.bool.must[i].range = addition.range;
                        itHappenedBefore = true;
                        break;
                    }
                    i++;
                }
            }
            if(!itHappenedBefore) {
                let futuremust;
                if(newBody.query.bool.must) {
                    futuremust = newBody.query.bool.must;
                    futuremust.push(addition);
                } else {
                    futuremust = [newBody.query, addition];
                }
                newBody.query = {
                    bool: {
                        must:
                            futuremust
                    }
                };
            }
        } else {    //It is ordered by relevance
            notSupported = true;
        }

        let loadMoreObservable = Observable.create((observer) => {
            if (/*!(oldRequestGreaterThan === greaterThan) && */!notSupported) {     //Last request and last log match. It means there has been a load more with the same result: no more results to be fetched
                this.currentRequest.body = JSON.stringify(newBody);
                let observableAux = Observable.create((observeraux) => this.requestWithState(this.currentRequest, observeraux));
                observableAux.subscribe(logs => {
                    observer.next(logs);
                }, (err)=>console.log(err), ()=>{observer.complete()});
            } else {
                //If last log's time (greaterThan) is the same as the last request, it means there were no more results to fetch
                observer.error(new Error("Request not supported. Reason: request to be ordered by relevance"));
            }
        });
        return loadMoreObservable;
    }

    loadByFile(file:string) {
        let newBody = JSON.parse(this.currentRequest.body);
        let addition = {
            "query_string" : {
                "default_field": "path",
                "query": "*" + file + "*"
            }
        };
        let itHappenedBefore = false;
        if(newBody.query.bool) {
            let i = 0;
            for(let musts of newBody.query.bool.must) {
                if(musts['query_string']) {             //check if loadByDate has already happened in current request
                    newBody.query.bool.must[i]['query_string'] = addition['query_string'];
                    itHappenedBefore = true;
                    break;
                }
                i++;
            }
        }
        if(!itHappenedBefore) {
            let futuremust;
            if(newBody.query.bool.must) {
                futuremust = newBody.query.bool.must;
                futuremust.push(addition);
            } else {
                futuremust = [newBody.query, addition];
            }
            newBody.query = {
                bool: {
                    must:
                      futuremust
                }
            };
        }

        this.state.filesFilter = addition;

        let url = ES_URL + INDEX + '/_search?scroll=1m&filter_path=_scroll_id,hits.hits._source,hits.hits._type';

        let requestOptions = this.wrapRequestOptions(url, newBody);

        let observable = Observable.create((observer) =>
            this.requestWithState(requestOptions, observer));

        return observable;
    }

    removeFileState() {
        this.state.filesFilter = "";
        //load grid without that filter
        //current request have that filter set, but requestWithState updates it
        let observable = Observable.create((observer) => this.requestWithState(this.currentRequest, observer));
        return observable;
    }

    wrapRequestOptions(url:string, body:any) {
        return new RequestOptions({
            method: RequestMethod.Post,
            url,
            body: JSON.stringify(body)
        });
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

    elasticLogProcessing(logEntry: any) {
        let type = logEntry._type;
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

        let path = logEntry._source.path;

        let logValue = {type, time, message, level, thread, logger, host, path};

        return logValue;
    }
}
