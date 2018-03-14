(function() {
    let data;
    function queryAddress(e) {
        e.preventDefault();
        // get lat long of query address
        var address = {query : document.getElementById("place").elements[0].value};
        window.coordinates = []
        service = new google.maps.places.PlacesService(map);
        service.textSearch(address, function(response, status) {
            if(status === "ZERO_RESULTS") {
                let searchResult = document.getElementById("search-result");
                searchResult.innerHTML = "No results found. Double check the address entered is a valid US address"
            } else {
                coordinates[0] = response[0].geometry.location.lat()
                coordinates[1] = response[0].geometry.location.lng()
                fetchNrel();
            }
        })
        let fetchNrel = function() {
            fetch(`https://developer.nrel.gov/api/pvwatts/v5.json?api_key=onERaASS23wzNhraWniTAeqqXSHF93fY4INxvrdR&format=JSON&lat=${coordinates[0]}&lon=${coordinates[1]}&system_capacity=4&azimuth=180&tilt=40&array_type=1&module_type=1&losses=10`)
            .then(function(response) {
                return response.json();
            })
            .then(function(nrelData) {
                initMap(coordinates, nrelData)

                data = nrelData;
                
                if(nrelData.warnings.length >= 0 || nrelData.errors.length >= 0) {
                    if(nrelData.warnings[0].slice(0,42) === "This location appears to be outside the US") {
                        let warning = document.getElementById("search-result");
                        warning.innerHTML = nrelData.warnings[0].slice(0,42) + '. Try entering a United States address'
                    } 
                    if(nrelData.errors.length >= 0) {
                        if(nrelData.errors[0].slice(0, 34) === "No climate data found with dataset") {
                            let error = document.getElementById("search-result");
                            error.innerHTML = "No climate data found with dataset. Try entering a United States address"
                        }
                    }
                }
            })
            .catch(function(error){
                console.log(error.message)
            })
        }
    }

    function initMap(coordinates, nrelData) {
        var defaultLoc = {lat: 41.418793, lng: -75.680906};
        coordinates ? defaultLoc = {lat: coordinates[0], lng: coordinates[1]} : {lat: 41.418793, lng: -75.680906};

        window.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: defaultLoc,
        });

        console.log(nrelData.station_info.city, nrelData.station_info.state)
        console.log(nrelData.outputs.solrad_monthly)
        
        // define LatLng coordinates for polygon's path
        var polygonCoords ;

        //new polygon coords if new coordinates is entered. otherwise, default to Scranton, Pennsylvania
        coordinates ? 
        polygonCoords = [
            {lat: coordinates[0], lng: coordinates[1]},
            {lat: coordinates[0] + .0005, lng: coordinates[1] + .0005},
            {lat: coordinates[0] - .0005, lng: coordinates[1] - .0005}
        ] 
        : polygonCoords = [
            {lat: 41.418793, lng: -75.680906},
            {lat: 41.418549, lng: -75.680440},
            {lat: 41.416466, lng: -75.682210},
            {lat: 41.416690, lng: -75.682769},
            // {lat: 41.418793, lng: -75.680906} // autocompleted 
        ]

        // construct the polygon
        var polygon = new google.maps.Polygon({
            paths: polygonCoords,
            editable: true,
            draggable: true,
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: 'FF0000',
            fillOpacity: 0.35
        });

        polygon.setMap(map);

        // add a listener 
        console.log('this', this);
        polygon.addListener('click', showInfo);
        infoWindow = new google.maps.InfoWindow;

        // probably won't need markers
        /*var marker = new google.maps.Marker({
            position: scranton,
            map: map
        });*/						
    }
    
    function showInfo(event) {
        let vertices = this.getPath(); // returns array of the coordinate objs
        let contentString = '<b> Your selected area is </b><br></br>' 

        let areaPath = [];

        for(let i = 0; i < vertices.getLength(); i++) {
            areaPath.push(vertices.getAt(i))
        }

        let area = google.maps.geometry.spherical.computeArea(areaPath)
        
        contentString += Math.round(area*100)/100 + ' sq meters<br></br>'
        contentString = data ? `${contentString}Information from climate station located in ${data.station_info.city}, ${data.station_info.state}` : null;

        infoWindow.setContent(contentString);
        infoWindow.setPosition(event.latLng);

        infoWindow.open(map);
    }

    function init() {
        const placeForm = document.getElementById('place');
        placeForm.addEventListener('submit', queryAddress);
        window.initMap = initMap;
    }

    init();
})();
