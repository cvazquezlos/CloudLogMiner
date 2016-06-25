import {Component, Input, Output} from '@angular/core';
import {EventEmitter} from "@angular/compiler/src/facade/async";

@Component({
  moduleId: module.id,
  selector: 'sd-rowdisplay',
  templateUrl: 'rowDisplay.component.html'
})
export class RowDisplay {
  @Input() row: any;
  @Output() selected: EventEmitter<string> = new EventEmitter<string>();
  private isClassVisible=false;
  
}
