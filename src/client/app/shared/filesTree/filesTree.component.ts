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
    @Input() markedBefore: Array<Directory>;
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
                for (let file of dir.files) {
                    file.dirChecked.subscribe((checkboxed)=> {
                        this.checked.emit(checkboxed);
                    });
                    file.dirUnchecked.subscribe((unchecked)=> {
                        this.unchecked.emit(unchecked);
                    });
                }
            }

            this.markFromPreviousPetition(this.directories);
        }

    }

    bubble(event) {
        this.directories[0].dirChecked.emit(event);
    }

    bubbleUnchecked(event) {
        this.directories[0].dirUnchecked.emit(event);
    }

    markFromPreviousPetition(directories: Array<Directory>) {
        if(this.markedBefore) {
            for(let d of directories) {
                for(let f of d.files) {
                    if(this.markedBefore.indexOf(f.name) > -1) {
                        f.checked = true;
                    }
                }

                if(this.markedBefore.indexOf(d.name) > -1) {
                    d.checked = true;

                } else {
                    //Recursively check all nested directories or files to see if marked. If marked its father is toggled.
                    this.markFromPreviousPetition(d.directories);
                    for(let di of d.directories) {
                        if(di.checked) {
                            d.toggle();
                        }
                    }
                    for (let f of d.files) {
                        if(f.checked) {
                            d.toggle();
                        }
                    }
                }
            }
        }
    }
}
