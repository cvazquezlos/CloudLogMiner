/* tslint:disable:no-unused-variable */
/**
 * Created by Silvia on 01/05/2016.
 */
import {GridComponent} from './grid.component';

import {
    expect, it, iit, xit,
    describe, ddescribe, xdescribe,
    beforeEach, beforeEachProviders, withProviders,
    async, inject, injectAsync
} from '@angular/core/testing';
import { Component } from '@angular/core';

import {TestComponentBuilder, ComponentFixture} from '@angular/compiler/testing';

import {By}             from '@angular/platform-browser';
import {provide, Directive}        from '@angular/core';
import {ViewMetadata}   from '@angular/core';
import {PromiseWrapper} from '@angular/core/src/facade/promise';


import {ElasticService} from "../shared/index";
import 'rxjs/add/operator/map';
import {Observable} from "rxjs/Rx";
import {fakeRowsProcessed} from "../shared/utils/fakeData";
import {FilesTree} from "../shared/filesTree/filesTree.component";
import {RowDisplay} from "../shared/rowDisplay/rowDisplay.component";
import {AgGridNg2} from "ag-grid-ng2/main";

export function main() {
    class MockElasticService {
        constructor() {
        }

        getRowsDefault() {
            console.log('sending fake answers!');
            return Observable.of(fakeRowsProcessed);
        }

        search(input:string, searchByRelevance:boolean) {
            let match:any[] = [];
            for (let log of fakeRowsProcessed) {
                for (let field in log) {
                    if (log[field].toLowerCase().indexOf(input.toLowerCase()) != -1) {
                        match.push(log);
                        break;
                    }
                }
            }
            return Observable.of(match);
        }

        loadByDate(lessThan, greaterThan) {
            //greater than 10-04-2016 less than 13-04-2016
            let rows = fakeRowsProcessed.slice(34, 39);
            return Observable.of(rows);
        }
    }

    class MockFilesTree {

    }

    class MockRowDisplay {

    }

    @Directive({
     selector: "ag-grid-ng2"
     })
     class MockAgGrid {
     constructor() {}
     }

    class MockGridOptions {
        public api = {
            showLoadingOverlay: () => {
            },
            hideOverlay: () => {
            }
        };

        constructor() {
            this.api.showLoadingOverlay = () => {
                console.log("Loading")
            };
            this.api.hideOverlay = () => {
            }
        };

    }

    describe('-> GridComponent <-', () => {
        let elasticService;
        let myComponent, element, fixture2;

        beforeEachProviders(() => [TestComponentBuilder, provide(ElasticService, { useClass: MockElasticService })]);

        /*beforeEachProviders(() => [
            provide(ElasticService, {useClass: MockElasticService})
        ]);*/

/*
        beforeEach(inject([TestComponentBuilder],  (tcb: TestComponentBuilder) => {
            return tcb
            //.overrideDirective(AgGridNg2, MockAgGrid)
                .createAsync(GridComponent)
                .then((fixture) => {
                    console.log("aqui estamos");
                    myComponent = fixture.componentInstance;
                    myComponent.gridOptions = new MockGridOptions();
                    element = fixture.nativeElement;
                    fixture.detectChanges();          //It should be needed to interact with DOM, but it's not
                });
            }
        ));*/

        it('shows list of log items when created', injectAsync([TestComponentBuilder], (tcb) => {
            tcb
                .overrideProviders(GridComponent, [
                    provide(FilesTree, {useClass: MockFilesTree}),
                    provide(RowDisplay, {useClass: MockRowDisplay}),
                    provide(AgGridNg2, {useClass: MockAgGrid})
                ])
                .overrideTemplate(GridComponent, '<span>ja</span>')
                .createAsync(GridComponent).then((fixture: ComponentFixture<GridComponent>) => {
                    fixture.detectChanges();
                    myComponent = fixture.componentInstance;
                    // component.ngOnInit(); // called by `fixture.detectChanges()`
            });
            //return tcb
            /*.overrideProviders(GridComponent,
             [ provide(ElasticService, {useClass: MockElasticService}) ])*/
                //.createAsync(GridComponent)
                //.then((fixture) => {
                    /*myComponent = fixture.componentInstance;
                    myComponent.gridOptions = new MockGridOptions();
                    element = fixture.nativeElement;
                    fixture.detectChanges();
                    expect(myComponent.rowData.length).toBe(40);
                    expect(myComponent.showLoadMore).toBe(false);        //Because is less than 50, no need for loading more
                    resolve();*/
                //});
        }));
/*
        it('searches among logs', () => {
            element.querySelector('.searchInput').value = "published";
            //trigger the 'search' button
            element.querySelector('.searchButton').click();
            expect(myComponent.rowData.length).toBe(13);
        });

        describe('loads by date', () => {
            let searchByDateButton;
            beforeEach(() => {
                searchByDateButton = element.querySelector('.searchByDate');
            });

            it('date is fine', () => {
                searchByDateButton.click();
                expect(myComponent.rowData.length).toBe(5);
            });

            it('date is bad formed', () => {
                element.querySelector('#from').value = "2016-04-17T08:10:55";
                element.querySelector('#to').value = "2016-04-12T08:00:43";
                searchByDateButton.click();
                fixture2.detectChanges();           //Otherwise the variable won't be updated in the template
                let error = element.querySelector('#errorMessage').textContent;
                expect(error).toBe("Please be sure that the 'to' field is not earlier than 'from' field");
            });
        });

        it('should mark rows matching a string', () => {
            //Logs displayed are the initial ones
            myComponent.mark("PingWatchdogSession");
            expect(myComponent.rowData[1].marked).toBe(true);
            expect(myComponent.rowData[37].marked).toBe(true);
        });

        it('should organize directories', () => {
            let dir = ["/app/poni/test/magic.file", "/app/juju/pe.ju"];
            let dire = myComponent.getDirectories();
            console.log(dire);
            //expect(dire.length).toBe(1); //Same root
            expect(dire.directories).notTobeUndefined();
            expect(dire.directories[0].directories[0].files.length).toBe(1);
        });
*/
    });
}
