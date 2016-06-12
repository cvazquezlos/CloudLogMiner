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
var router_1 = require('@angular/router');
var http_1 = require('@angular/http');
var index_1 = require('./+about/index');
var index_2 = require('./grid/index');
var index_3 = require('./shared/index');
var AppComponent = (function () {
    function AppComponent() {
    }
    AppComponent = __decorate([
        core_1.Component({
            moduleId: module.id,
            selector: 'sd-app',
            viewProviders: [index_3.NameListService, http_1.HTTP_PROVIDERS],
            templateUrl: 'app.component.html',
            directives: [router_1.ROUTER_DIRECTIVES, index_3.NavbarComponent, index_3.ToolbarComponent]
        }),
        router_1.Routes([
            {
                path: '/',
                component: index_2.GridComponent
            },
            {
                path: '/about',
                component: index_1.AboutComponent
            }
        ]), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9hcHAuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7QUFBQSxxQkFBMEIsZUFBZSxDQUFDLENBQUE7QUFDMUMsdUJBQTBDLGlCQUFpQixDQUFDLENBQUE7QUFDNUQscUJBQThCLGVBQWUsQ0FBQyxDQUFBO0FBRTlDLHNCQUErQixnQkFBZ0IsQ0FBQyxDQUFBO0FBRWhELHNCQUE0QixjQUFjLENBQUMsQ0FBQTtBQUMzQyxzQkFBbUUsZ0JBQWdCLENBQUMsQ0FBQTtBQXVCcEY7SUFBQTtJQUEyQixDQUFDO0lBakI1QjtRQUFDLGdCQUFTLENBQUM7WUFDVCxRQUFRLEVBQUUsTUFBTSxDQUFDLEVBQUU7WUFDbkIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsYUFBYSxFQUFFLENBQUMsdUJBQWUsRUFBRSxxQkFBYyxDQUFDO1lBQ2hELFdBQVcsRUFBRSxvQkFBb0I7WUFDakMsVUFBVSxFQUFFLENBQUMsMEJBQWlCLEVBQUUsdUJBQWUsRUFBRSx3QkFBZ0IsQ0FBQztTQUNuRSxDQUFDO1FBQ0QsZUFBTSxDQUFDO1lBQ047Z0JBQ0UsSUFBSSxFQUFFLEdBQUc7Z0JBQ1QsU0FBUyxFQUFFLHFCQUFhO2FBQ3pCO1lBQ0Q7Z0JBQ0UsSUFBSSxFQUFFLFFBQVE7Z0JBQ2QsU0FBUyxFQUFFLHNCQUFjO2FBQzFCO1NBQ0YsQ0FBQzs7b0JBQUE7SUFDeUIsbUJBQUM7QUFBRCxDQUEzQixBQUE0QixJQUFBO0FBQWYsb0JBQVksZUFBRyxDQUFBIiwiZmlsZSI6ImFwcC9hcHAuY29tcG9uZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tcG9uZW50IH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBST1VURVJfRElSRUNUSVZFUywgUm91dGVzIH0gZnJvbSAnQGFuZ3VsYXIvcm91dGVyJztcbmltcG9ydCB7IEhUVFBfUFJPVklERVJTfSBmcm9tICdAYW5ndWxhci9odHRwJztcblxuaW1wb3J0IHsgQWJvdXRDb21wb25lbnQgfSBmcm9tICcuLythYm91dC9pbmRleCc7XG5pbXBvcnQgeyBIb21lQ29tcG9uZW50IH0gZnJvbSAnLi8raG9tZS9pbmRleCc7XG5pbXBvcnQge0dyaWRDb21wb25lbnR9IGZyb20gJy4vZ3JpZC9pbmRleCc7XG5pbXBvcnQgeyBOYW1lTGlzdFNlcnZpY2UsIE5hdmJhckNvbXBvbmVudCwgVG9vbGJhckNvbXBvbmVudCB9IGZyb20gJy4vc2hhcmVkL2luZGV4JztcblxuLyoqXG4gKiBUaGlzIGNsYXNzIHJlcHJlc2VudHMgdGhlIG1haW4gYXBwbGljYXRpb24gY29tcG9uZW50LiBXaXRoaW4gdGhlIEBSb3V0ZXMgYW5ub3RhdGlvbiBpcyB0aGUgY29uZmlndXJhdGlvbiBvZiB0aGVcbiAqIGFwcGxpY2F0aW9ucyByb3V0ZXMsIGNvbmZpZ3VyaW5nIHRoZSBwYXRocyBmb3IgdGhlIGxhenkgbG9hZGVkIGNvbXBvbmVudHMgKEhvbWVDb21wb25lbnQsIEFib3V0Q29tcG9uZW50KS5cbiAqL1xuQENvbXBvbmVudCh7XG4gIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gIHNlbGVjdG9yOiAnc2QtYXBwJyxcbiAgdmlld1Byb3ZpZGVyczogW05hbWVMaXN0U2VydmljZSwgSFRUUF9QUk9WSURFUlNdLFxuICB0ZW1wbGF0ZVVybDogJ2FwcC5jb21wb25lbnQuaHRtbCcsXG4gIGRpcmVjdGl2ZXM6IFtST1VURVJfRElSRUNUSVZFUywgTmF2YmFyQ29tcG9uZW50LCBUb29sYmFyQ29tcG9uZW50XVxufSlcbkBSb3V0ZXMoW1xuICB7XG4gICAgcGF0aDogJy8nLFxuICAgIGNvbXBvbmVudDogR3JpZENvbXBvbmVudFxuICB9LFxuICB7XG4gICAgcGF0aDogJy9hYm91dCcsXG4gICAgY29tcG9uZW50OiBBYm91dENvbXBvbmVudFxuICB9XG5dKVxuZXhwb3J0IGNsYXNzIEFwcENvbXBvbmVudCB7fVxuIl19
