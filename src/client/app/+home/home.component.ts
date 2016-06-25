import {Component} from '@angular/core';
import { Router } from '@angular/router'

import {ElasticService} from '../shared/index';
import {RowDisplay} from '../shared/index';

/**
 * This class represents the lazy loaded HomeComponent.
 */
@Component({
    moduleId: module.id,
    selector: 'sd-home',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css'],
    directives: [RowDisplay]
})
export class HomeComponent {

    public url: string;
    public index: string;
    public exampleRow:any;
    private rowToSelectTime:any;

    /**
     * Creates an instance of the HomeComponent with the injected
     * ElasticService.
     *
     * @param {ElasticService} elasticService - The injected ElasticService.
     */
    constructor(public _elasticService:ElasticService, private router: Router) {
        if(_elasticService.elasticURL && _elasticService.elasticINDEX) {
            let userurl = _elasticService.elasticURL.split("/");
            this.url = userurl[2];

            let baseindex = _elasticService.elasticINDEX;
            //elasticSearch pattern format: < string -*>:
            let index = baseindex.substring(baseindex.lastIndexOf("<")+1,baseindex.lastIndexOf("-*"));
            this.index = index;
        }
    }

    submitElasticAddress() {
        this._elasticService.elasticURL = "http://"+this.url+"/";
        //elasticSearch pattern format: < string -*>:
        this._elasticService.elasticINDEX = "<"+this.index+"-*>";

        this._elasticService.getFirstLog().subscribe((log: any) => {
            let keys = Object.keys(log);
            this.exampleRow = {data: log, keys};
            this.rowToSelectTime = this.exampleRow;
        });

        //DEFAULT NO LONGER APPLY
        this._elasticService.fields = [];
        this._elasticService.isTimestampField="";
    }

    private attributeSelected(at: string){
        if(this._elasticService.fields.indexOf(at)<0) {
            this._elasticService.fields.push(at);
        }
    }

    private thisIsTimestamp(t: string) {
        if(this._elasticService.fields.indexOf(t)<0) {
            this._elasticService.fields.push(t);
        }
        this._elasticService.isTimestampField = t;
        this.rowToSelectTime = undefined;
    }
}
