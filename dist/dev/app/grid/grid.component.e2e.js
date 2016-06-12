describe('Home', function () {
    beforeEach(function () {
        browser.get('');
    });
    it('should have an input', function () {
        expect(element(by.css('sd-app sd-home form input')).isPresent()).toEqual(true);
    });
    it('should have a list of computer scientists', function () {
        expect(element(by.css('sd-app sd-home ul')).getText())
            .toEqual('Edsger Dijkstra\nDonald Knuth\nAlan Turing\nGrace Hopper');
    });
    it('should add a name to the list using the form', function () {
        element(by.css('sd-app sd-home form input')).sendKeys('Tim Berners-Lee');
        element(by.css('sd-app sd-home form button')).click();
        expect(element(by.css('sd-app sd-home ul')).getText())
            .toEqual('Edsger Dijkstra\nDonald Knuth\nAlan Turing\nGrace Hopper\nTim Berners-Lee');
    });
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9ncmlkL2dyaWQuY29tcG9uZW50LmUyZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxRQUFRLENBQUMsTUFBTSxFQUFFO0lBRWYsVUFBVSxDQUFFO1FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsQixDQUFDLENBQUMsQ0FBQztJQUVILEVBQUUsQ0FBQyxzQkFBc0IsRUFBRTtRQUN6QixNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2pGLENBQUMsQ0FBQyxDQUFDO0lBRUgsRUFBRSxDQUFDLDJDQUEyQyxFQUFFO1FBQzlDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7YUFDbkQsT0FBTyxDQUFDLDBEQUEwRCxDQUFDLENBQUM7SUFDekUsQ0FBQyxDQUFDLENBQUM7SUFFSCxFQUFFLENBQUMsOENBQThDLEVBQUU7UUFDakQsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3pFLE9BQU8sQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUN0RCxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDO2FBQ25ELE9BQU8sQ0FBQywyRUFBMkUsQ0FBQyxDQUFDO0lBQzFGLENBQUMsQ0FBQyxDQUFDO0FBQ0wsQ0FBQyxDQUFDLENBQUMiLCJmaWxlIjoiYXBwL2dyaWQvZ3JpZC5jb21wb25lbnQuZTJlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiZGVzY3JpYmUoJ0hvbWUnLCAoKSA9PiB7XG5cbiAgYmVmb3JlRWFjaCggKCkgPT4ge1xuICAgIGJyb3dzZXIuZ2V0KCcnKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBoYXZlIGFuIGlucHV0JywgKCkgPT4ge1xuICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnc2QtYXBwIHNkLWhvbWUgZm9ybSBpbnB1dCcpKS5pc1ByZXNlbnQoKSkudG9FcXVhbCh0cnVlKTtcbiAgfSk7XG5cbiAgaXQoJ3Nob3VsZCBoYXZlIGEgbGlzdCBvZiBjb21wdXRlciBzY2llbnRpc3RzJywgKCkgPT4ge1xuICAgIGV4cGVjdChlbGVtZW50KGJ5LmNzcygnc2QtYXBwIHNkLWhvbWUgdWwnKSkuZ2V0VGV4dCgpKVxuICAgICAgLnRvRXF1YWwoJ0Vkc2dlciBEaWprc3RyYVxcbkRvbmFsZCBLbnV0aFxcbkFsYW4gVHVyaW5nXFxuR3JhY2UgSG9wcGVyJyk7XG4gIH0pO1xuXG4gIGl0KCdzaG91bGQgYWRkIGEgbmFtZSB0byB0aGUgbGlzdCB1c2luZyB0aGUgZm9ybScsICgpID0+IHtcbiAgICBlbGVtZW50KGJ5LmNzcygnc2QtYXBwIHNkLWhvbWUgZm9ybSBpbnB1dCcpKS5zZW5kS2V5cygnVGltIEJlcm5lcnMtTGVlJyk7XG4gICAgZWxlbWVudChieS5jc3MoJ3NkLWFwcCBzZC1ob21lIGZvcm0gYnV0dG9uJykpLmNsaWNrKCk7XG4gICAgZXhwZWN0KGVsZW1lbnQoYnkuY3NzKCdzZC1hcHAgc2QtaG9tZSB1bCcpKS5nZXRUZXh0KCkpXG4gICAgICAudG9FcXVhbCgnRWRzZ2VyIERpamtzdHJhXFxuRG9uYWxkIEtudXRoXFxuQWxhbiBUdXJpbmdcXG5HcmFjZSBIb3BwZXJcXG5UaW0gQmVybmVycy1MZWUnKTtcbiAgfSk7XG59KTtcbiJdfQ==
