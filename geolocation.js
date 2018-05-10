let x = document.getElementById("demo");

app.getLocation = function() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(app.showPosition);
    }
}

app.showPosition = function (position) {
    const longitude = position.coords.longitude;
    const latitude = position.coords.latitude; 
    app.initMap(latitude, longitude);
    app.getWashroomsByCoords(latitude, longitude);
    app.reverseGeocode(position);
}

app.reverseGeocode = function(position) {
    $.ajax({
            url: 'https://maps.googleapis.com/maps/api/geocode/json',
            dataType: 'json',
            data: {
                key: 'AIzaSyBcN4eKsS7abfkHXltNx_d8x9AASWzKuaA',
                latlng: `${position.coords.latitude},${position.coords.longitude}`
            },
        })
        .then((res) => {
            $('#search').val(res.results[0].formatted_address);
        });
}

$(function() {
    app.getLocation();
})