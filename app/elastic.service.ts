/**
 * Created by silvia on 26/2/16.
 */
import {Http} from 'angular2/http';
import 'rxjs/add/operator/map';
import {Injectable} from "angular2/core";

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
        return this._http.get("http://localhost:9200/"+index+"/_search?q=*&pretty")
            .map( (responseData) => {
                return responseData.json();
            })
            .map((answer) => {
                let result:Array<any>=[];
                if (answer) {
                    answer.hits.hits.forEach(log=> {
                        result.push(log._source);
                    })
                }
                console.log(result);
                return result;
            })
    }
}
