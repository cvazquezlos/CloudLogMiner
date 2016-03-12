/**
 * Created by silvia on 26/2/16.
 */

//Removed map.d import as no necessary
import {Injectable} from "angular2/core";
import {Http, Response, HTTP_PROVIDERS, Headers, RequestOptions, RequestMethod, Request} from 'angular2/http';

const ES_URL = 'http://127.0.0.1:9200/';
const INDEX = "<logstash-*>";

@Injectable()
export class ElasticService {

    constructor(private _http: Http) {}

    listIndices() {
        return this._http.get('http://localhost:9200/_stats/index,store')
            .map(res=>res.json())
            .map(res => {
                return Object.getOwnPropertyNames(res.indices);
            });
    }

    listAllLogs(index:String) {
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
                                            "gte": "now-20d",
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
            size: "50",
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
}
