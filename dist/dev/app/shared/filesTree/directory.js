"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var Directory = (function () {
    function Directory(name, directories, files) {
        this.dirChecked = new core_1.EventEmitter();
        this.dirUnchecked = new core_1.EventEmitter();
        this.name = name;
        this.files = files;
        this.directories = directories;
        this.expanded = false;
        this.checked = false;
    }
    Directory.prototype.toggle = function () {
        this.expanded = !this.expanded;
    };
    Directory.prototype.check = function (event) {
        var newState = !this.checked;
        this.checked = newState;
        this.checkRecursive(newState);
        if (this.checked) {
            this.dirChecked.emit(event);
        }
        else {
            this.dirUnchecked.emit(event);
        }
    };
    Directory.prototype.checkRecursive = function (state) {
        this.directories.forEach(function (d) {
            d.checked = state;
            d.checkRecursive(state);
        });
    };
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], Directory.prototype, "dirChecked", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], Directory.prototype, "dirUnchecked", void 0);
    return Directory;
}());
exports.Directory = Directory;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9zaGFyZWQvZmlsZXNUcmVlL2RpcmVjdG9yeS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7O0FBR0EscUJBQW1DLGVBQWUsQ0FBQyxDQUFBO0FBRW5EO0lBU0ksbUJBQVksSUFBSSxFQUFDLFdBQVcsRUFBQyxLQUFLO1FBUnhCLGVBQVUsR0FBRyxJQUFJLG1CQUFZLEVBQUUsQ0FBQztRQUNoQyxpQkFBWSxHQUFHLElBQUksbUJBQVksRUFBRSxDQUFDO1FBUXhDLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO1FBQ25CLElBQUksQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFDO1FBQy9CLElBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDO0lBQ3pCLENBQUM7SUFFRCwwQkFBTSxHQUFOO1FBQ0ksSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUM7SUFDbkMsQ0FBQztJQUVELHlCQUFLLEdBQUwsVUFBTSxLQUFLO1FBQ1AsSUFBSSxRQUFRLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQzdCLElBQUksQ0FBQyxPQUFPLEdBQUcsUUFBUSxDQUFDO1FBQ3hCLElBQUksQ0FBQyxjQUFjLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDOUIsRUFBRSxDQUFBLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7WUFDZCxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoQyxDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixJQUFJLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNsQyxDQUFDO0lBQ0wsQ0FBQztJQUVELGtDQUFjLEdBQWQsVUFBZSxLQUFLO1FBQ2hCLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLFVBQUEsQ0FBQztZQUN0QixDQUFDLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztZQUNsQixDQUFDLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVCLENBQUMsQ0FBQyxDQUFBO0lBQ04sQ0FBQztJQXBDRDtRQUFDLGFBQU0sRUFBRTs7aURBQUE7SUFDVDtRQUFDLGFBQU0sRUFBRTs7bURBQUE7SUFvQ2IsZ0JBQUM7QUFBRCxDQXRDQSxBQXNDQyxJQUFBO0FBdENZLGlCQUFTLFlBc0NyQixDQUFBIiwiZmlsZSI6ImFwcC9zaGFyZWQvZmlsZXNUcmVlL2RpcmVjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ3JlYXRlZCBieSBUb3JnZWlyIEhlbGdldm9sZC4gTW9kaWZpZWQgYnkgU2lsdmlhXG4gKi9cbmltcG9ydCB7T3V0cHV0LCBFdmVudEVtaXR0ZXJ9IGZyb20gXCJAYW5ndWxhci9jb3JlXCI7XG5cbmV4cG9ydCBjbGFzcyBEaXJlY3Rvcnl7XG4gICAgQE91dHB1dCgpIGRpckNoZWNrZWQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgQE91dHB1dCgpIGRpclVuY2hlY2tlZCA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICBcbiAgICBuYW1lOiBzdHJpbmc7XG4gICAgZGlyZWN0b3JpZXM6IEFycmF5PERpcmVjdG9yeT47XG4gICAgZmlsZXM6IEFycmF5PFN0cmluZz47XG4gICAgZXhwYW5kZWQ6IGJvb2xlYW47XG4gICAgY2hlY2tlZDogYm9vbGVhbjtcbiAgICBjb25zdHJ1Y3RvcihuYW1lLGRpcmVjdG9yaWVzLGZpbGVzKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuZmlsZXMgPSBmaWxlcztcbiAgICAgICAgdGhpcy5kaXJlY3RvcmllcyA9IGRpcmVjdG9yaWVzO1xuICAgICAgICB0aGlzLmV4cGFuZGVkID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY2hlY2tlZCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHRvZ2dsZSgpe1xuICAgICAgICB0aGlzLmV4cGFuZGVkID0gIXRoaXMuZXhwYW5kZWQ7XG4gICAgfVxuXG4gICAgY2hlY2soZXZlbnQpe1xuICAgICAgICBsZXQgbmV3U3RhdGUgPSAhdGhpcy5jaGVja2VkO1xuICAgICAgICB0aGlzLmNoZWNrZWQgPSBuZXdTdGF0ZTtcbiAgICAgICAgdGhpcy5jaGVja1JlY3Vyc2l2ZShuZXdTdGF0ZSk7XG4gICAgICAgIGlmKHRoaXMuY2hlY2tlZCkge1xuICAgICAgICAgICAgdGhpcy5kaXJDaGVja2VkLmVtaXQoZXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5kaXJVbmNoZWNrZWQuZW1pdChldmVudCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjaGVja1JlY3Vyc2l2ZShzdGF0ZSl7XG4gICAgICAgIHRoaXMuZGlyZWN0b3JpZXMuZm9yRWFjaChkID0+IHtcbiAgICAgICAgICAgIGQuY2hlY2tlZCA9IHN0YXRlO1xuICAgICAgICAgICAgZC5jaGVja1JlY3Vyc2l2ZShzdGF0ZSk7XG4gICAgICAgIH0pXG4gICAgfVxufSJdfQ==
