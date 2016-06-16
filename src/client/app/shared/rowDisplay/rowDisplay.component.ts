import {Component, Input} from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'sd-rowdisplay',
  templateUrl: 'rowDisplay.component.html'
})
export class RowDisplay {
  @Input() row: any;
}
