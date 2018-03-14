(function() {
    const fetchNrel = window.fetchNrel;
    const initMap = window.initMap;
    const coordinates = [];
    function queryAddress(e) {
        e.preventDefault();
        // get latitutde and longitude of querried address by querying through Google Places API
        const address = {query : document.getElementById("place").elements[0].value};
        service = new google.maps.places.PlacesService(map);
        service.textSearch(address, function(response, status) {
            if(status === "ZERO_RESULTS") {
                const searchResult = document.getElementById("search-result");
                searchResult.innerHTML = "Search not found. Please enter a valid United States address.";
            } else {
                coordinates[0] = response[0].geometry.location.lat();
                coordinates[1] = response[0].geometry.location.lng();
                fetchNrel(coordinates)
                    .then(setNrel)
                    .catch(console.error);
            };
        });
        const setNrel = function(nrelData) {
            // reinitialize map with queried address coordinates and fetched nrel data passed in 
            initMap(coordinates, nrelData);
            
            //throw errors and instruction text if location is outside US or unavailable
            const instructionText = document.getElementById("search-result");
            instructionText.innerHTML = "Location found. Drag the polygon to capture desired area. Click area for more details.";

            if(nrelData.warnings.length > 0) {
                if(nrelData.warnings[0].slice(0,42) === "This location appears to be outside the US") {
                    instructionText.innerHTML = `${nrelData.warnings[0].slice(0,42)}. Try entering a United States address`;
                } 
                console.log(nrelData.warnings);
            }
            if(nrelData.errors.length > 0) {
                console.log(nrelData.errors);
                instructionText.innerHTML = `No climate data available for this location. Make sure to search within US`;
            }
        };
    };

    function init() {
        // grab and add event listener to address search box
        const placeForm = document.getElementById('place');
        placeForm.addEventListener('submit', queryAddress);
    };

    init();
})();
