/**
 * Created by Torgeir Helgevold.
 */

import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Directory} from './directory';
@Component({
    moduleId: module.id,
    selector: 'files-tree',
    templateUrl: 'files.tree.html',
    directives: [FilesTree]
})
export class FilesTree {
    @Input() directories: Array<Directory>;
    @Output() checked = new EventEmitter<string>();
    @Output() unchecked = new EventEmitter<string>();

    ngOnChanges() {         //Intercept input property changes
        if(this.directories) {
            for (let dir of this.directories) {
                dir.dirChecked.subscribe((checkboxed)=> {
                    this.checked.emit(checkboxed);
                });
                dir.dirUnchecked.subscribe((unchecked)=> {
                    this.unchecked.emit(unchecked);
                });
            }
        }
    }

    bubble(event) {
        this.directories[0].dirChecked.emit(event);
    }

    bubbleUnchecked(event) {
        this.directories[0].dirUnchecked.emit(event);
    }
}
