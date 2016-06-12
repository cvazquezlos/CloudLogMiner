"use strict";
var directory_1 = require("../filesTree/directory");
function getDirectories(rows) {
    var data = [];
    for (var _i = 0, rows_1 = rows; _i < rows_1.length; _i++) {
        var row = rows_1[_i];
        buildTree(row.path.split('/'), data);
    }
    return directoryFormat(data);
}
exports.getDirectories = getDirectories;
function buildTree(parts, treeNode) {
    if (parts.length === 0) {
        return;
    }
    if (parts[0] != "") {
        for (var i = 0; i < treeNode.length; i++) {
            if (parts[0] == treeNode[i].text) {
                buildTree(parts.splice(1, parts.length), treeNode[i].children);
                return;
            }
        }
        var newNode = { 'text': parts[0], 'children': [] };
        treeNode.push(newNode);
        buildTree(parts.splice(1, parts.length), newNode.children);
    }
    else {
        parts.splice(0, 1);
        buildTree(parts, treeNode);
    }
}
function recursiveFormat(d) {
    var subDirectories, files = [];
    while (d.children[0].children && d.children[0].children.length > 0) {
        subDirectories = directoryFormat(d.children);
        return new directory_1.Directory(d.text, subDirectories, []);
    }
    var i = 0;
    for (var _i = 0, _a = d.children; _i < _a.length; _i++) {
        var c = _a[_i];
        d.children[i] = c.text;
        i++;
    }
    return new directory_1.Directory(d.text, [], d.children);
}
function directoryFormat(data) {
    var directories = [];
    for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
        var d = data_1[_i];
        directories.push(recursiveFormat(d));
    }
    return directories;
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9zaGFyZWQvdXRpbHMvZm9ybWF0dGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwwQkFBd0Isd0JBQXdCLENBQUMsQ0FBQTtBQUtqRCx3QkFBK0IsSUFBSTtJQUMvQixJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7SUFDZCxHQUFHLENBQUMsQ0FBWSxVQUFJLEVBQUosYUFBSSxFQUFKLGtCQUFJLEVBQUosSUFBSSxDQUFDO1FBQWhCLElBQUksR0FBRyxhQUFBO1FBQ1IsU0FBUyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQ3hDO0lBQ0QsTUFBTSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBTmUsc0JBQWMsaUJBTTdCLENBQUE7QUFFRCxtQkFBbUIsS0FBSyxFQUFFLFFBQVE7SUFDOUIsRUFBRSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ3JCLE1BQU0sQ0FBQztJQUNYLENBQUM7SUFDRCxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUN2QyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7Z0JBQy9CLFNBQVMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2dCQUMvRCxNQUFNLENBQUM7WUFDWCxDQUFDO1FBQ0wsQ0FBQztRQUNELElBQUksT0FBTyxHQUFHLEVBQUMsTUFBTSxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFDLENBQUM7UUFDakQsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN2QixTQUFTLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBQ0QsSUFBSSxDQUFDLENBQUM7UUFDRixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNsQixTQUFTLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7QUFDTCxDQUFDO0FBRUQseUJBQXlCLENBQUM7SUFDdEIsSUFBSSxjQUFjLEVBQUUsS0FBSyxHQUFHLEVBQUUsQ0FBQztJQUMvQixPQUFPLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQztRQUNqRSxjQUFjLEdBQUcsZUFBZSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQztRQUM3QyxNQUFNLENBQUMsSUFBSSxxQkFBUyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0lBQ3BELENBQUM7SUFDRCxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDVixHQUFHLENBQUMsQ0FBVSxVQUFVLEVBQVYsS0FBQSxDQUFDLENBQUMsUUFBUSxFQUFWLGNBQVUsRUFBVixJQUFVLENBQUM7UUFBcEIsSUFBSSxDQUFDLFNBQUE7UUFDTixDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUM7UUFDdkIsQ0FBQyxFQUFFLENBQUM7S0FDUDtJQUNELE1BQU0sQ0FBQyxJQUFJLHFCQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ2pELENBQUM7QUFFRCx5QkFBeUIsSUFBSTtJQUN6QixJQUFJLFdBQVcsR0FBRyxFQUFFLENBQUM7SUFFckIsR0FBRyxDQUFDLENBQVUsVUFBSSxFQUFKLGFBQUksRUFBSixrQkFBSSxFQUFKLElBQUksQ0FBQztRQUFkLElBQUksQ0FBQyxhQUFBO1FBQ04sV0FBVyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUN4QztJQUNELE1BQU0sQ0FBQyxXQUFXLENBQUM7QUFDdkIsQ0FBQyIsImZpbGUiOiJhcHAvc2hhcmVkL3V0aWxzL2Zvcm1hdHRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi4vZmlsZXNUcmVlL2RpcmVjdG9yeVwiO1xuLyoqXG4gKiBDcmVhdGVkIGJ5IHNpbHZpYSBvbiAzMS81LzE2LlxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXREaXJlY3Rvcmllcyhyb3dzKSB7XG4gICAgbGV0IGRhdGEgPSBbXTtcbiAgICBmb3IgKGxldCByb3cgb2Ygcm93cykge1xuICAgICAgICBidWlsZFRyZWUocm93LnBhdGguc3BsaXQoJy8nKSwgZGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBkaXJlY3RvcnlGb3JtYXQoZGF0YSk7XG59XG5cbmZ1bmN0aW9uIGJ1aWxkVHJlZShwYXJ0cywgdHJlZU5vZGUpIHtcbiAgICBpZiAocGFydHMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHBhcnRzWzBdICE9IFwiXCIpIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0cmVlTm9kZS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHBhcnRzWzBdID09IHRyZWVOb2RlW2ldLnRleHQpIHtcbiAgICAgICAgICAgICAgICBidWlsZFRyZWUocGFydHMuc3BsaWNlKDEsIHBhcnRzLmxlbmd0aCksIHRyZWVOb2RlW2ldLmNoaWxkcmVuKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld05vZGUgPSB7J3RleHQnOiBwYXJ0c1swXSwgJ2NoaWxkcmVuJzogW119O1xuICAgICAgICB0cmVlTm9kZS5wdXNoKG5ld05vZGUpO1xuICAgICAgICBidWlsZFRyZWUocGFydHMuc3BsaWNlKDEsIHBhcnRzLmxlbmd0aCksIG5ld05vZGUuY2hpbGRyZW4pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcGFydHMuc3BsaWNlKDAsIDEpO1xuICAgICAgICAgYnVpbGRUcmVlKHBhcnRzLCB0cmVlTm9kZSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZWN1cnNpdmVGb3JtYXQoZCkge1xuICAgIGxldCBzdWJEaXJlY3RvcmllcywgZmlsZXMgPSBbXTtcbiAgICB3aGlsZSAoZC5jaGlsZHJlblswXS5jaGlsZHJlbiAmJiBkLmNoaWxkcmVuWzBdLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgc3ViRGlyZWN0b3JpZXMgPSBkaXJlY3RvcnlGb3JtYXQoZC5jaGlsZHJlbik7XG4gICAgICAgIHJldHVybiBuZXcgRGlyZWN0b3J5KGQudGV4dCwgc3ViRGlyZWN0b3JpZXMsIFtdKVxuICAgIH1cbiAgICBsZXQgaSA9IDA7XG4gICAgZm9yIChsZXQgYyBvZiBkLmNoaWxkcmVuKSB7ICAvL2NoaWxkcmVuIHdlcmUgb2JqZWN0cywgbm93IHRoZXkgYXJlIHN0cmluZ3NcbiAgICAgICAgZC5jaGlsZHJlbltpXSA9IGMudGV4dDtcbiAgICAgICAgaSsrO1xuICAgIH1cbiAgICByZXR1cm4gbmV3IERpcmVjdG9yeShkLnRleHQsIFtdLCBkLmNoaWxkcmVuKTtcbn1cblxuZnVuY3Rpb24gZGlyZWN0b3J5Rm9ybWF0KGRhdGEpIHtcbiAgICBsZXQgZGlyZWN0b3JpZXMgPSBbXTtcblxuICAgIGZvciAobGV0IGQgb2YgZGF0YSkge1xuICAgICAgICBkaXJlY3Rvcmllcy5wdXNoKHJlY3Vyc2l2ZUZvcm1hdChkKSk7XG4gICAgfVxuICAgIHJldHVybiBkaXJlY3Rvcmllcztcbn1cbiJdfQ==