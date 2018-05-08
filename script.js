const app = {};

app.getCoordinates = function (search) { 
    $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        dataType: 'json',
        data: {
            key: 'AIzaSyBcN4eKsS7abfkHXltNx_d8x9AASWzKuaA',
            address: search 
        }
    })
    .then((res) => {
        console.log(res);
        const latitude = res.results[0].geometry.location.lat;
        const longitude = res.results[0].geometry.location.lng;
        const location = res.results[0].formatted_address;

        app.getWashroomsByCoords(latitude, longitude);
    }); 
}

app.getWashroomsByCoords = function (latitude, longitude) {
    const unisexVal = $('#unisex').prop('checked');
    const accessibleVal = $('#accessible').prop('checked');
    console.log(`Unisex: ${unisexVal}; Accessible: ${accessibleVal}`);


    $.ajax({
        url: 'https://www.refugerestrooms.org:443/api/v1/restrooms/by_location.json',
        dataType: 'json',
        data: {
            ada: accessibleVal,
            unisex: unisexVal,
            lat: latitude,
            lng: longitude
        }
    })
         .then( (results) => {
            const washroomArray = results;
            app.displayWashroom(washroomArray);
        }); 
    }

    // backup, may not need 
app.getWashroomsBySearchTerm = function (search) {
    $.ajax({
        url: 'https://www.refugerestrooms.org:443/api/v1/restrooms/search.json',
        dataType: 'json',
        data: {
            ada: true,
            unisex: true,
            query: search
        }
    })
        .then((results) => {
            const washroomArray = results;
            console.log(results);
            app.displayWashroom(washroomArray);
        });
}

app.displayWashroom = function(washrooms) {
    $('#washrooms').empty();
    washrooms.forEach((washroom) => {
        const streetAddress = washroom.street.trim();
        const city = washroom.city.trim();
        
        const $name = $('<h2>').text(washroom.name);
        
        // create map link
        const washroomLat = washroom.latitude;
        const washroomLong = washroom.longitude;
        // const mapURL = `https://www.google.com/maps/search/?api=1&query=${washroomLat},${washroomLong}`;
        const mapURL = `https://www.google.com/maps/search/?api=1&query=${streetAddress}+${city}`;
        const $address = $('<p>').html(`<a href="${mapURL}" target="_blank">${streetAddress}, ${city}</a>`);
        
        // create features list and populate with features, if they exist
        const accessibleStatus = washroom.accessible;
        const unisexStatus = washroom.unisex;
        const changeTableStatus = washroom.changing_table;
        const $featuresList = $('<ul class="features">');
        if(unisexStatus) {
            const $unisex = $('<li>').text(`Unisex: ${unisexStatus}`);
            $featuresList.append($unisex);
        }
        if(accessibleStatus) {
            const $accessible = $('<li>').text(`Wheelchair accessible: ${accessibleStatus}`);
            $featuresList.append($accessible);
        }
        if(changeTableStatus) {
            const $changeTable = $('<li>').text(`Change table: ${changeTableStatus}`);
            $featuresList.append($changeTable);
        }
        
        // put directions and comments into their own div so they can be shown or hidden
        const directions = washroom.directions;
        const comment = washroom.comment;
        const $washroomInfo = $('<div class="more-info">');
        if(directions) {
            $washroomInfo.append(`<p>Directions: ${directions}</p>`);
        }
        if (comment) {
            $washroomInfo.append(`<p>Comments: ${comment}</p>`);
        }
        const $washroomContainer = $("<div>").append($name, $address, $featuresList);
        if($washroomInfo.text().length > 0) {
            $washroomContainer.append("<button class='toggle-more-info'>More info</button>");
            $washroomContainer.append($washroomInfo);
        }

        // append washroom container
       $('#washrooms').append($washroomContainer);
       $('.more-info').hide();
    });
}


app.events = function() {

    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const searchTerm = $(this).children('input[type=search]').val();
        app.getCoordinates(searchTerm);
    });

    $('#washrooms').on("click", ".toggle-more-info", function(e) {
        e.stopPropagation();
        e.preventDefault();        
        $(this).next('.more-info').toggle();
    })
}

// 2. create an init method
app.init = function () {
    app.events();
}
// 3. create a document ready to store it all in
$(function () {
    app.init();
});
