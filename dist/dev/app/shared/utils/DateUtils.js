"use strict";
function toInputLiteral(date) {
    return date.getUTCFullYear() + '-' +
        pad(date.getUTCMonth() + 1, 2) + "-" +
        pad(date.getUTCDate(), 2) + "T" +
        pad(date.getHours(), 2) + ":" +
        pad(date.getMinutes(), 2) + ":" +
        pad(date.getSeconds(), 2);
}
exports.toInputLiteral = toInputLiteral;
function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC9zaGFyZWQvdXRpbHMvRGF0ZVV0aWxzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSx3QkFBK0IsSUFBVTtJQUNyQyxNQUFNLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxHQUFHLEdBQUc7UUFDOUIsR0FBRyxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsR0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRztRQUNsQyxHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLEdBQUc7UUFDL0IsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUMsR0FBRyxHQUFHO1FBQzdCLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEdBQUcsR0FBRztRQUMvQixHQUFHLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ2xDLENBQUM7QUFQZSxzQkFBYyxpQkFPN0IsQ0FBQTtBQUVELGFBQWEsQ0FBQyxFQUFFLEtBQUssRUFBRSxDQUFFO0lBQ3JCLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDO0lBQ2IsQ0FBQyxHQUFHLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDWCxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxLQUFLLEdBQUcsQ0FBQyxHQUFHLElBQUksS0FBSyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDL0UsQ0FBQyIsImZpbGUiOiJhcHAvc2hhcmVkL3V0aWxzL0RhdGVVdGlscy5qcyIsInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBmdW5jdGlvbiB0b0lucHV0TGl0ZXJhbChkYXRlOiBEYXRlKSB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0VVRDRnVsbFllYXIoKSArICctJyArXG4gICAgICAgIHBhZChkYXRlLmdldFVUQ01vbnRoKCkrMSwgMikgKyBcIi1cIiArXG4gICAgICAgIHBhZChkYXRlLmdldFVUQ0RhdGUoKSwgMikgKyBcIlRcIiArXG4gICAgICAgIHBhZChkYXRlLmdldEhvdXJzKCksIDIpICsgXCI6XCIgK1xuICAgICAgICBwYWQoZGF0ZS5nZXRNaW51dGVzKCksIDIpICsgXCI6XCIgK1xuICAgICAgICBwYWQoZGF0ZS5nZXRTZWNvbmRzKCksIDIpO1xufVxuXG5mdW5jdGlvbiBwYWQobiwgd2lkdGgsIHo/KSB7XG4gICAgeiA9IHogfHwgJzAnO1xuICAgIG4gPSBuICsgJyc7XG4gICAgcmV0dXJuIG4ubGVuZ3RoID49IHdpZHRoID8gbiA6IG5ldyBBcnJheSh3aWR0aCAtIG4ubGVuZ3RoICsgMSkuam9pbih6KSArIG47XG59XG4iXX0=