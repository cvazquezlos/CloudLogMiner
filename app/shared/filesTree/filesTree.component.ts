/**
 * Created by Torgeir Helgevold.
 */

import {Component, Input} from '@angular/core';
import {Directory} from './directory';
@Component({
    selector: 'files-tree',
    templateUrl: './app/shared/filesTree/filesTree.html',
    directives: [FilesTree]
})
export class FilesTree {
    @Input() directories: Array<Directory>;
}