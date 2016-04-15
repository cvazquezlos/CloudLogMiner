import {bootstrap}    from 'angular2/platform/browser';
import {AppComponent} from './app.component';
import {ElasticService} from './shared/elastic.service'
import {HTTP_PROVIDERS} from "angular2/http";

bootstrap(<any>AppComponent, [ElasticService, HTTP_PROVIDERS]);
