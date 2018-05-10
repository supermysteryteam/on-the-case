const app = {};

app.getCoordinates = function (search) { 
    $.ajax({
        url: 'https://maps.googleapis.com/maps/api/geocode/json',
        dataType: 'json',
        data: {
            key: 'AIzaSyBcN4eKsS7abfkHXltNx_d8x9AASWzKuaA',
            address: search 
        },
    })
    .then((res) => {
        console.log(res);
        const latitude = res.results[0].geometry.location.lat;
        const longitude = res.results[0].geometry.location.lng;
        const location = res.results[0].formatted_address;

        app.getWashroomsByCoords(latitude, longitude);
        app.initMap(latitude, longitude, location);
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
         .then( (res) => {
            const washroomArray = res;
            app.getMap;
            app.displayWashroom(washroomArray);
        }); 
    };

app.myMap;

app.initMap = function(latitude, longitude, location) {
    app.myMap = new google.maps.Map(document.getElementById('map'), {
        center: { lat: latitude,lng: longitude },
        zoom: 15
    });
    app.addInitialMarker(latitude, longitude, location);
}


app.addInitialMarker = function(latitude, longitude, location) {
    let marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: app.myMap,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'white',
            fillOpacity: 0.6,
            strokeColor: 'purple',
            strokeWeight: 14
        }
});
};

app.addMarker = function(latitude, longitude, location, address) {
    let marker = new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: app.myMap,
        icon: {
            path: google.maps.SymbolPath.CIRCLE,
            fillColor: 'white',
            fillOpacity: 0.6,
            strokeColor: 'green',
            strokeWeight: 14
        }
    });
    

    let infoWindowContent = `<p>${location}</p>`
    if (address) {
        infoWindowContent += `<p>${address}</p>`
    }

    let infoWindow = new google.maps.InfoWindow({
        content: infoWindowContent
    });

    marker.addListener('click', function() {
        infoWindow.open(map, marker);
    })
}

   
function titleCase(str) {
    return str.toLowerCase().split(' ').map(function (word) {
        return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
}

app.displayWashroom = function(washrooms) {
    $('#washrooms').empty();
    console.log(washrooms)


    _.uniq(washrooms,(washroom) => washroom.street.split(' ').splice(0,2).join(' ').toLowerCase()).forEach((washroom) => {
        const $name = $('<h2>').text(titleCase(washroom.name));
        const streetAddress = washroom.street.trim();
        app.addMarker(washroom.latitude, washroom.longitude, washroom.name, streetAddress);
        
        const city = washroom.city.trim();

        
        // create map link
        const washroomLat = washroom.latitude;
        const washroomLong = washroom.longitude;
        // const mapURL = `https://www.google.com/maps/search/?api=1&query=${washroomLat},${washroomLong}`;
        const mapURL = `https://www.google.com/maps/search/?api=1&query=${streetAddress}+${city}`;
        const $address = $('<p>').html(`<a href="${mapURL}" target="_blank">${titleCase(streetAddress)}, ${city}</a>`);
        
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

// add title for search result and update with search term
app.updateSearchTitle = function(titleText) {
    $('#searchTitle').remove();
    const $searchResultTitle = $('<h2 id="searchTitle" class="search-title">').text(`Showing search results for ${titleText}`);
    $('#washrooms').before($searchResultTitle);
}


app.events = function() {

    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const searchTerm = $(this).children('input[type=search]').val();
        app.getCoordinates(searchTerm);
        app.updateSearchTitle(searchTerm);
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
