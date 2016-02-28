/**
 * Created by silvia on 26/2/16.
 */
import {bootstrap} from 'angular2/platform/browser';
import {AppComponent} from './app/app.component';
import {HTTP_PROVIDERS} from 'angular2/http';
import {ElasticService} from './app/elastic.service';

bootstrap(AppComponent, [HTTP_PROVIDERS,ElasticService])
    .catch(err => console.log(err)); // useful to catch the errors