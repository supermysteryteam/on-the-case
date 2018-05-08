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
    $.ajax({
        url: 'https://www.refugerestrooms.org:443/api/v1/restrooms/by_location.json',
        dataType: 'json',
        data: {
            ada: true,
            unisex: true,
            lat: latitude,
            lng: longitude
        }
    })
         .then( (results) => {
            const washroomArray = results;
            // console.log(results);
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
            // console.log(results);
            app.displayWashroom(washroomArray);
        });
}

app.displayWashroom = function(washrooms) {
    $('#washrooms').empty();
   // console.log(data)
    washrooms.forEach((washroom) => {
       console.log(washroom.name);
        const $name = $('<h2>').text(washroom.name);
        const $address = $('<p>').text(washroom.street);
        // const $directions = $('<p>').text(washroom.directions);
        const $unisex = $('<p>').text(washroom.unisex);
        const $accessible = $('<p>').text(washroom.accessible);

       const $washroomContainer = $("<div>").append($name, $address);
       $('#washrooms').append($washroomContainer);
    });
}



app.events = function() {
    
    $('#searchForm').on('submit', function(e) {
        e.preventDefault();
        const searchTerm = $(this).children('input[type=search]').val();
        app.getCoordinates(searchTerm);
    })
}

    // app.events = function () {
    //     $('#animal').on('change', function () {
    //         // console.log('hi')
    //         const selectedAnimal = $(this).val();
    //         // console.log(selectedAnimal);
    //         app.getArt(selectedAnimal);
    //         app.updateTitle();
    //     });
    // }




// 2. create an init method
app.init = function () {
    app.events();
}
// 3. create a document ready to store it all in
$(function () {
    app.init();

});
