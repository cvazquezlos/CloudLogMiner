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

/*
Please note that the function loadMore is tested along with each of the possible preceding functions. This decision was purely by convenience as its behaviour depends on the service state.
ElasticService state relies heavily in currentRequest property, as load more and date queries use it to be consistent with the previous request.
 */

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

    describe('getRowsDefault', () => {
        it('should return 40 logs', () => {
            elasticService.getRowsDefault().subscribe(rows => {
                expect(rows.length).toBe(40);
            });
        });
        it('should be consistent with loadMore', () => {
            //First it happens
            elasticService.getRowsDefault();
            /*
            It changes the service state, by updating currentRequest.
            Now we are able to test loadMore.
             */
            let lastLog = fakeData.hits.hits[0];
            spyOn(elasticService, 'loadByDate').and.callThrough();
            spyOn(elasticService, 'listAllLogs').and.callThrough();
            let lt = "2016-04-17T07:10:55.601Z";    //static fake data, earlier than lastLog
            let gt = "2016-04-17T08:06:55.601Z";
            let fakeBody = JSON.parse(elasticService.currentRequest.body);
            //listAllLogs gives away a "now" parameter to be interpreted by elasticSearch. We would rather fake it
            fakeBody["query"].filtered.filter.bool.must[0].range['@timestamp']={
                "gte": gt,
                "lte": lt
            };
            elasticService.currentRequest.body = JSON.stringify(fakeBody);
            elasticService.loadMore(elasticService.elasticLogProcessing(lastLog)).subscribe(() => {
                lt = "2016-04-17T08:10:55.601Z";    //static fake data consistent with lastLog (changes in variable requestOptions)
                gt = "2016-04-17T08:10:55.601Z||-200d";
                expect(elasticService.loadByDate).toHaveBeenCalledWith(lt, gt);
                expect(elasticService.listAllLogs).toHaveBeenCalledWith(elasticService.currentRequest, jasmine.anything());
            });
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

    describe('search', () => {
        it('should fabricate the correct arguments for the http call', () => {
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

        it('should be consistent with loadMore', () => {
            //First it happens
            elasticService.search("test", false);
            /*
             It changes the service state, by updating currentRequest.
             Now we are able to test loadMore.
             */
            let lastLog = fakeData.hits.hits[0];
            spyOn(elasticService, 'loadByDate').and.callThrough();
            spyOn(elasticService, 'listAllLogs').and.callThrough();
                
            elasticService.loadMore(elasticService.elasticLogProcessing(lastLog)).subscribe(() => {
                let lt = "2016-04-17T08:10:55.601Z";    //static fake data, consistent with lastLog
                let gt = "2016-04-17T08:10:55.601Z||-200d";
                let expectedBody = {
                    "query" :{
                    "filtered" : {
                        "query" : {
                            "multi_match" : "test"
                        },
                        "filter" : {
                            "range": {
                                '@timestamp': {
                                    "gte": gt,
                                    "lte": lt
                                }
                            }
                        }
                    }
                },
                    sort: [
                        { "@timestamp": "desc" }
                    ]
                };
                let expectedRequest = elasticService.currentRequest;
                expectedRequest.body = expectedBody;
                expect(elasticService.loadByDate).toHaveBeenCalledWith(lt, gt);
                expect(elasticService.listAllLogs).toHaveBeenCalledWith(expectedRequest, jasmine.anything());
            });
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
