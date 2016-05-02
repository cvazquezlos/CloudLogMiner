/**
 * Created by Silvia on 16/04/2016.
 */
import {describe, it, expect, inject, beforeEach, beforeEachProviders} from 'angular2/testing'; //Very important to import angular2 specific ones
import {ElasticService} from "./elastic.service";
import {
    HTTP_PROVIDERS, ResponseOptions, Response, BaseRequestOptions, XHRBackend,
    RequestOptions, RequestMethod
} from 'angular2/http';
import 'rxjs/add/operator/map';
import {MockBackend} from 'angular2/http/testing';
import {fakeD} from './../fakeData';
import {provide} from 'angular2/core';
import {Observable} from "rxjs/Observable";

describe('ElasticService', () => {
    let elasticService;
    let fakeData = fakeD;
   beforeEachProviders(() => [
        ElasticService,
        BaseRequestOptions,
        HTTP_PROVIDERS,
        provide(XHRBackend, {useClass: MockBackend})
    ]);

    beforeEach(inject([ElasticService, XHRBackend], (es, backend) => {
        elasticService = es;
        //Mock data length is 40
        elasticService.maxResults = 40;        
        const baseResponse = new Response(new ResponseOptions({body: JSON.stringify(fakeData)}));
        backend.connections.subscribe((c) => c.mockRespond(baseResponse));
    }));

    it('has sizeOfPage 10', () => {
        expect(elasticService.sizeOfPage).toBe(10);
    });

    it('getRowsDefault should return 40 logs', () => {
        elasticService.getRowsDefault().subscribe(rows => {
            expect(rows.length).toBe(40);
            console.log(JSON.stringify(rows));
        });
    });

    describe('listAllLogs', () => {
        let ro: RequestOptions;
        beforeEach(() => {
            spyOn(elasticService, 'listAllLogs').and.callThrough();
            ro = new RequestOptions({
                method: RequestMethod.Post,
                url: "fake",
                body: "fake"
            });

        });
        describe('when sizeOfPage>=maxResults', () => {
            let exampleSize = 40;
            beforeEach(() =>{
                elasticService.maxResults = exampleSize;
                elasticService.sizeOfPage = exampleSize;
            });

            it('should be executed once', () => {
                let observable = Observable.create((observer) =>
                        elasticService.listAllLogs(ro, observer))
                    .subscribe(answer => {},
                        (fail)=>{},
                        ()=> {
                    //Final number of executions won't be known until fetching is completed. Otherwise expect would be triggered in the first batch.
                            expect(elasticService.listAllLogs.calls.count()).toBe(1);
                        }
                    );
            });
        });
        describe('when sizeOfPage<maxResults', () => {
            let exampleSize = 40;
            beforeEach(() =>{
                elasticService.maxResults = exampleSize * 2;
                elasticService.sizeOfPage = exampleSize;
            });
            it('should be executed recursively', () => {
                let observable = Observable.create((observer) =>
                        elasticService.listAllLogs(ro, observer))
                    .subscribe(answer => {},
                        (fail)=>{},
                        ()=>{expect(elasticService.listAllLogs.calls.count()).toBe(2);}
                    );
            });
        });
    });

    it('scroll id should change after a request', () => {
        expect(elasticService.scroll).toBe("");
        elasticService.getRowsDefault().subscribe(rows => {
            expect(elasticService.scroll).not.toBe("");
        });
        elasticService.scroll="";
        elasticService.search("debug").subscribe(rows => {
            expect(elasticService.scroll).not.toBe("");
        });
        elasticService.scroll="";
        elasticService.loadMore(fakeData.hits.hits[0]).subscribe(rows => {
            expect(elasticService.scroll).not.toBe("");
        });
    });

    it('search should fabricate the correct arguments for the listAllLogs http call', () => {
        elasticService.sizeOfPage = 40;
        let body = {
            "query":{
                "multi_match": {
                    "query":"test",
                    "type":"best_fields",
                    "fields": ["type", "host", "message", elasticService.fields.level, elasticService.fields.logger, elasticService.fields.thread],         //Not filter by time: parsing user input would be required
                    "tie_breaker":0.3,
                    "minimum_should_match":"30%"
                }
            },
            size:40,
            sort: [{ '@timestamp': 'desc'}]
        };
        let url = 'http://127.0.0.1:9200/<logstash-*>' + '/_search?scroll=1m';

        let requestOptions2 = new RequestOptions({
            method: RequestMethod.Post,
            url,
            body: JSON.stringify(body)
        });

        /*A spy is needed to check if listAllLogs is called with proper arguments. spyOn would make the method null, and thus it would not emmit anything. Search's inner subscribe to the spied listAllLogs would never be reached. We use "and.callThrough to execute the spied method nevertheless*/

        spyOn(elasticService, 'listAllLogs').and.callThrough();
        elasticService.search("test", false).subscribe(r => {
            expect(elasticService.listAllLogs).toHaveBeenCalledWith(requestOptions2, jasmine.anything());
            expect(r.length).toBe(40);
        });
    });

    describe('loadMore', () => {
        describe('during a default request', () => {
            it('should create a correct date interval, older than the current', () => {
               //TODO
                // Lo que realmente queremos testear aquí no es que el string que mandemos sea el correcto (lo será, es sólo añadir -200) sino cómo lo trata elasticsearch. eso solo podriamos hacerlo en un enToEnd test
                //¿Qué debemos testear entonces?
            });
        });
        describe('during a search request', () => {
            
        });
        describe('during an unsupported request', () => {
            
        });
    });

    it('elasticLogProcessing should return a formatted log', () => {
        let toBeChecked = elasticService.elasticLogProcessing(fakeData.hits.hits[0]);
        var actual = Object.keys(toBeChecked).sort();
        var expected = [
            'type',
            'time',
            'message',
            'level',
            'thread',
            'logger',
            'host'
        ].sort();

        expect(actual).toEqual(expected);
        expect(toBeChecked.time).toBeDefined();
    });

    it('should return 40 logs properly parsed', () => {
        let toBeChecked = elasticService.mapLogs(fakeData);
        expect(toBeChecked.length).toBe(40);
    })

});
