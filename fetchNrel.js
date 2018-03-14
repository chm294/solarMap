(function(){
    let data;
    let fetchNrel = function(coordinates) {
        return fetch(`https://developer.nrel.gov/api/pvwatts/v5.json?api_key=onERaASS23wzNhraWniTAeqqXSHF93fY4INxvrdR&format=JSON&lat=${coordinates[0]}&lon=${coordinates[1]}&system_capacity=4&azimuth=180&tilt=40&array_type=1&module_type=1&losses=10`)
        .then(function(response) {
            data = response.json();
            return data;
        });
    };

    window.fetchNrel = fetchNrel
})();
