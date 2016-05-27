/**
 * Created by Torgeir Helgevold.
 */

import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Directory} from './directory';
@Component({
    selector: 'files-tree',
    templateUrl: './app/shared/filesTree/filesTree.html',
    directives: [FilesTree]
})
export class FilesTree {
    @Input() directories: Array<Directory>;
    @Output() checked = new EventEmitter<string>();

    ngOnChanges() {         //Intercept input property changes
        if(this.directories) {
            for (let dir of this.directories) {
                dir.dirChecked.subscribe((checkboxed)=> {
                    this.checked.emit(checkboxed);
                });
            }
        }
    }
}