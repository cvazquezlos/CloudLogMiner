/**
 * Created by Torgeir Helgevold. Modified by Silvia
 */
import {Output, EventEmitter} from "@angular/core";

export class Directory{
    @Output() dirChecked = new EventEmitter();
    @Output() dirUnchecked = new EventEmitter();
    
    name: string;
    directories: Array<Directory>;
    files: Array<Directory>;
    expanded: boolean;
    checked: boolean;
    constructor(name, directories, files) {
        this.name = name;
        this.files = [];
        for(let f of files) {
            let nf = new Directory(f, [], []);
            this.files.push(nf);
        }
        //this.files = files;
        this.directories = directories;
        this.expanded = false;
        this.checked = false;
    }

    toggle(){
        this.expanded = !this.expanded;
    }

    check(event){
        let newState = !this.checked;
        this.checked = newState;
        this.checkRecursive(newState);
        if(this.checked) {
            this.dirChecked.emit(event);
        } else {
            this.dirUnchecked.emit(event);
        }
    }

    checkRecursive(state){
        this.directories.forEach(d => {
            d.checked = state;
            d.checkRecursive(state);
        })
    }
}