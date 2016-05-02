/**
 * Created by silvia on 1/5/16.
 */
import {describe, it, expect, inject, beforeEach, beforeEachProviders} from 'angular2/testing';
import {ElasticService} from './shared/elastic.service';
import {fakeRowsProcessed} from './fakeData';
import {Observable} from "rxjs/Observable";

class MockElasticService extends ElasticService {
    constructor() {
        super(null);
    }
    
    getRowsDefault() {
        return Observable.of(fakeRowsProcessed);
    }
}
