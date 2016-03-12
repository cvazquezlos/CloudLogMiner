import {bootstrap}    from 'angular2/platform/browser'
import {AppComponent} from './component/app.component'
import {ElasticService} from './service/elastic.service'
import {HTTP_PROVIDERS} from "angular2/http";

bootstrap(AppComponent, [ElasticService, HTTP_PROVIDERS]);
