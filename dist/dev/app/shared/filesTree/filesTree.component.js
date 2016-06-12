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
var core_1 = require('@angular/core');
var FilesTree = (function () {
    function FilesTree() {
        this.checked = new core_1.EventEmitter();
        this.unchecked = new core_1.EventEmitter();
    }
    FilesTree.prototype.ngOnChanges = function () {
        var _this = this;
        if (this.directories) {
            for (var _i = 0, _a = this.directories; _i < _a.length; _i++) {
                var dir = _a[_i];
                dir.dirChecked.subscribe(function (checkboxed) {
                    _this.checked.emit(checkboxed);
                });
                dir.dirUnchecked.subscribe(function (unchecked) {
                    _this.unchecked.emit(unchecked);
                });
            }
        }
    };
    FilesTree.prototype.bubble = function (event) {
        this.directories[0].dirChecked.emit(event);
    };
    FilesTree.prototype.bubbleUnchecked = function (event) {
        this.directories[0].dirUnchecked.emit(event);
    };
    __decorate([
        core_1.Input(), 
        __metadata('design:type', Array)
    ], FilesTree.prototype, "directories", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], FilesTree.prototype, "checked", void 0);
    __decorate([
        core_1.Output(), 
        __metadata('design:type', Object)
    ], FilesTree.prototype, "unchecked", void 0);
    FilesTree = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'files-tree',
            templateUrl: 'files.tree.html',
            directives: [FilesTree]
        }), 
        __metadata('design:paramtypes', [])
    ], FilesTree);
    return FilesTree;
}());
exports.FilesTree = FilesTree;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9zaGFyZWQvZmlsZXNUcmVlL2ZpbGVzVHJlZS5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUlBLHFCQUFxRCxlQUFlLENBQUMsQ0FBQTtBQVFyRTtJQUFBO1FBRWMsWUFBTyxHQUFHLElBQUksbUJBQVksRUFBVSxDQUFDO1FBQ3JDLGNBQVMsR0FBRyxJQUFJLG1CQUFZLEVBQVUsQ0FBQztJQXNCckQsQ0FBQztJQXBCRywrQkFBVyxHQUFYO1FBQUEsaUJBV0M7UUFWRyxFQUFFLENBQUEsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztZQUNsQixHQUFHLENBQUMsQ0FBWSxVQUFnQixFQUFoQixLQUFBLElBQUksQ0FBQyxXQUFXLEVBQWhCLGNBQWdCLEVBQWhCLElBQWdCLENBQUM7Z0JBQTVCLElBQUksR0FBRyxTQUFBO2dCQUNSLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFVBQUMsVUFBVTtvQkFDaEMsS0FBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7Z0JBQ2xDLENBQUMsQ0FBQyxDQUFDO2dCQUNILEdBQUcsQ0FBQyxZQUFZLENBQUMsU0FBUyxDQUFDLFVBQUMsU0FBUztvQkFDakMsS0FBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7Z0JBQ25DLENBQUMsQ0FBQyxDQUFDO2FBQ047UUFDTCxDQUFDO0lBQ0wsQ0FBQztJQUVELDBCQUFNLEdBQU4sVUFBTyxLQUFLO1FBQ1IsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQy9DLENBQUM7SUFFRCxtQ0FBZSxHQUFmLFVBQWdCLEtBQUs7UUFDakIsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ2pELENBQUM7SUF2QkQ7UUFBQyxZQUFLLEVBQUU7O2tEQUFBO0lBQ1I7UUFBQyxhQUFNLEVBQUU7OzhDQUFBO0lBQ1Q7UUFBQyxhQUFNLEVBQUU7O2dEQUFBO0lBVGI7UUFBQyxnQkFBUyxDQUFDO1lBQ1AsUUFBUSxFQUFFLE1BQU0sQ0FBQyxFQUFFO1lBQ25CLFFBQVEsRUFBRSxZQUFZO1lBQ3RCLFdBQVcsRUFBRSxpQkFBaUI7WUFDOUIsVUFBVSxFQUFFLENBQUMsU0FBUyxDQUFDO1NBQzFCLENBQUM7O2lCQUFBO0lBMEJGLGdCQUFDO0FBQUQsQ0F6QkEsQUF5QkMsSUFBQTtBQXpCWSxpQkFBUyxZQXlCckIsQ0FBQSIsImZpbGUiOiJhcHAvc2hhcmVkL2ZpbGVzVHJlZS9maWxlc1RyZWUuY29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDcmVhdGVkIGJ5IFRvcmdlaXIgSGVsZ2V2b2xkLlxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50LCBJbnB1dCwgT3V0cHV0LCBFdmVudEVtaXR0ZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtEaXJlY3Rvcnl9IGZyb20gJy4vZGlyZWN0b3J5JztcbkBDb21wb25lbnQoe1xuICAgIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gICAgc2VsZWN0b3I6ICdmaWxlcy10cmVlJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2ZpbGVzLnRyZWUuaHRtbCcsXG4gICAgZGlyZWN0aXZlczogW0ZpbGVzVHJlZV1cbn0pXG5leHBvcnQgY2xhc3MgRmlsZXNUcmVlIHtcbiAgICBASW5wdXQoKSBkaXJlY3RvcmllczogQXJyYXk8RGlyZWN0b3J5PjtcbiAgICBAT3V0cHV0KCkgY2hlY2tlZCA9IG5ldyBFdmVudEVtaXR0ZXI8c3RyaW5nPigpO1xuICAgIEBPdXRwdXQoKSB1bmNoZWNrZWQgPSBuZXcgRXZlbnRFbWl0dGVyPHN0cmluZz4oKTtcblxuICAgIG5nT25DaGFuZ2VzKCkgeyAgICAgICAgIC8vSW50ZXJjZXB0IGlucHV0IHByb3BlcnR5IGNoYW5nZXNcbiAgICAgICAgaWYodGhpcy5kaXJlY3Rvcmllcykge1xuICAgICAgICAgICAgZm9yIChsZXQgZGlyIG9mIHRoaXMuZGlyZWN0b3JpZXMpIHtcbiAgICAgICAgICAgICAgICBkaXIuZGlyQ2hlY2tlZC5zdWJzY3JpYmUoKGNoZWNrYm94ZWQpPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrZWQuZW1pdChjaGVja2JveGVkKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBkaXIuZGlyVW5jaGVja2VkLnN1YnNjcmliZSgodW5jaGVja2VkKT0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51bmNoZWNrZWQuZW1pdCh1bmNoZWNrZWQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgYnViYmxlKGV2ZW50KSB7XG4gICAgICAgIHRoaXMuZGlyZWN0b3JpZXNbMF0uZGlyQ2hlY2tlZC5lbWl0KGV2ZW50KTtcbiAgICB9XG5cbiAgICBidWJibGVVbmNoZWNrZWQoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5kaXJlY3Rvcmllc1swXS5kaXJVbmNoZWNrZWQuZW1pdChldmVudCk7XG4gICAgfVxufVxuIl19
