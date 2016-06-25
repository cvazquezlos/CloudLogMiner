import {Component} from '@angular/core';
import {Router} from "@angular/router";

/**
 * This class represents the toolbar component.
 */
@Component({
    moduleId: module.id,
    selector: 'sd-toolbar',
    templateUrl: 'toolbar.component.html',
    styleUrls: ['toolbar.component.css']
})
export class ToolbarComponent {
    constructor(private router:Router) {
    }
}
