/**
 * Created by Silvia on 01/05/2016.
 */
import {
    describe, it, expect, inject, beforeEach, beforeEachProviders, TestComponentBuilder,
    setBaseTestProviders, injectAsync
} from 'angular2/testing'; //Very important to import angular2 specific ones
import {ElasticService} from "./shared/elastic.service";
import {
    HTTP_PROVIDERS, ResponseOptions, Response, BaseRequestOptions, XHRBackend,
    RequestOptions, RequestMethod
} from 'angular2/http';
import 'rxjs/add/operator/map';
import {MockBackend} from 'angular2/http/testing';
import {provide} from 'angular2/core';
import {Observable} from "rxjs/Rx";
import {fakeRowsProcessed} from "./fakeData";
import {AppComponent} from "./app.component";
import {
    TEST_BROWSER_PLATFORM_PROVIDERS,
    TEST_BROWSER_APPLICATION_PROVIDERS
} from 'angular2/platform/testing/browser';
setBaseTestProviders(TEST_BROWSER_PLATFORM_PROVIDERS,
    TEST_BROWSER_APPLICATION_PROVIDERS);

class MockElasticService {
    constructor() {}

    getRowsDefault() {
        console.log('sending fake answers!');
        return Observable.of(fakeRowsProcessed);
    }
}

describe('AppComponent', () => {
    let elasticService;
    beforeEachProviders(() => [
        provide(ElasticService, {useClass: MockElasticService}),
    ]);

    it('shows list of log items by default tcb', injectAsync([TestComponentBuilder], (tcb) => {
        return tcb
            .createAsync(AppComponent)
            .then((fixture) => {
                let myComponent = fixture.componentInstance;
                expect(myComponent.rowData.length).toBe(40);
                expect(myComponent.gridOptions).not.toBeUndefined();
            })
    }));

});




