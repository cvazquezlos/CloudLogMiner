/**
 * Created by silvia on 26/2/16.
 */

//Removed map.d import as no necessary
import {Injectable} from "angular2/core";
import {Http, Response, HTTP_PROVIDERS, Headers, RequestOptions, RequestMethod, Request} from 'angular2/http';
import {EventEmitter} from "angular2/core";

/*
 const ES_URL = 'http://127.0.0.1:9200/';
 const INDEX = "<logstash-*>";*/

const ES_URL = 'http://jenkins:jenkins130@elasticsearch.kurento.org:9200/';
const INDEX = "<kurento-*>";


@Injectable()
export class ElasticService {


    scrollId:string="";         //Elasticsearch scroll indicator

    public loading$: EventEmitter<Boolean>;

    constructor(private _http: Http) {
        this.loading$ = new EventEmitter();
    }

    private listIndices() {                     //Unused
        return this._http.get('http://localhost:9200/_stats/index,store')
            .map(res=>res.json())
            .map(res => {
                return Object.getOwnPropertyNames(res.indices);
            });
    }

    public listAllLogs(sizeOfPage:number) {
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
            size: sizeOfPage
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


    public scrollElastic () {
        let body = {
            "scroll" : "1m",
            "scroll_id" : this.scrollId
        };
        let url = ES_URL + '/_search/scroll';
        let requestoptions = new RequestOptions({
            method: RequestMethod.Post,
            url,
            body: JSON.stringify(body)
        });
        return this._http.request(new Request(requestoptions))

    }

    search(value:string): void {
        let body = {
            "multi_match": {
                "query":value,
                "type":"best_fields",
                "fields": "*",
                "tie_breaker":0.3,
                "minimum_should_match":"30%"
            }
        }
    }
}
