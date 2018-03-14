(function() {
    let data;
    function queryAddress(e) {
        e.preventDefault();
        // get lat long of query address
        var address = {query : document.getElementById("place").elements[0].value};
        window.coordinates = [];
        service = new google.maps.places.PlacesService(map);
        service.textSearch(address, function(response, status) {
            if(status === "ZERO_RESULTS") {
                let searchResult = document.getElementById("search-result");
                searchResult.innerHTML = "Search not found. Please enter a valid United States address.";
            } else {
                coordinates[0] = response[0].geometry.location.lat();
                coordinates[1] = response[0].geometry.location.lng();
                fetchNrel();
            }
        })
        let fetchNrel = function() {
            fetch(`https://developer.nrel.gov/api/pvwatts/v5.json?api_key=onERaASS23wzNhraWniTAeqqXSHF93fY4INxvrdR&format=JSON&lat=${coordinates[0]}&lon=${coordinates[1]}&system_capacity=4&azimuth=180&tilt=40&array_type=1&module_type=1&losses=10`)
            .then(function(response) {
                return response.json();
            })
            .then(function(nrelData) {
                
                data = nrelData;
                initMap(coordinates, data);
                
                let instructionText = document.getElementById("search-result");
                instructionText.innerHTML = "Location found. Drag the polygon to capture desired area. Click area for more details.";

                if(data.warnings.length > 0) {
                    if(data.warnings[0].slice(0,42) === "This location appears to be outside the US") {
                        instructionText.innerHTML = `${data.warnings[0].slice(0,42)}. Try entering a United States address`;
                    } 
                    console.log(data.warnings);
                }
                if(data.errors.length > 0) {
                    console.log(data.errors);
                    instructionText.innerHTML = `No climate data available for this location. Make sure to search within US`;
                }
            })
            .catch(function(error){
                console.log(error.message);
            })
        }
    };

    function initMap(coordinates, nrelData) {
        var defaultLoc = {lat: 41.418793, lng: -75.680906};
        coordinates ? defaultLoc = {lat: coordinates[0], lng: coordinates[1]} : {lat: 41.418793, lng: -75.680906};

        window.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: defaultLoc,
        });
        
        
        // create polygon
        var polygonCoords;
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
        ];

        // construct the polygon
        var polygon = new google.maps.Polygon({
            paths: polygonCoords,
            editable: true,
            draggable: true,
            geodesic: true,
            strokeColor: '#FD6E38',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FDA938',
            fillOpacity: 0.35
        });

        polygon.setMap(map);
        polygon.addListener('click', showInfo);
        infoWindow = new google.maps.InfoWindow;				
    };
    
    function showInfo(event) {
        let vertices = this.getPath(); // returns array of the coordinate objs
        let areaPath = [];
        let area;
        for(let i = 0; i < vertices.getLength(); i++) {
            areaPath.push(vertices.getAt(i));
        }
        area = google.maps.geometry.spherical.computeArea(areaPath);

        console.log(data.outputs);

        const date = new Date();
        const months = [];
        months[0] = ["January", 31];
        months[1] = ["February", 28];
        months[2] = ["March", 31];
        months[3] = ["April", 30];
        months[4] = ["May", 31];
        months[5] = ["June",30];
        months[6] = ["July", 31];
        months[7] = ["August", 31];
        months[8] = ["September", 30];
        months[9] = ["October", 31];
        months[10] = ["November", 30];
        months[11] = ["December", 31];

        let currentMonthNum = date.getMonth();
        let currentMonthString = months[currentMonthNum][0];
        let monthLength = months[currentMonthNum][1];

        //rounded to nearest whole number
        // Monthly solar radiation values in (kWh/m2/day) * selected Area * number of days in that month
        const energyForCurrentMonth = Math.round(data.outputs.solrad_monthly[currentMonthNum]*area*monthLength);
        // Annual solar radiation value in (kWh/m2/day) * selected Area * 365 days 
        const energyAnnual = Math.round(data.outputs.solrad_annual*area*365);



        let contentString = `<b> Your selected area is </b><br></br> ${Math.round(area*100)/100} sq meters<br></br>`;
        
        if(data) {
            contentString = `${contentString}
            Monthly solar radiation for selected area during ${currentMonthString}: ${energyForCurrentMonth} kWh <br>
            Annual solar radiation for selected area: ${energyAnnual} kWh<br>
            Information from closest climate station located in ${data.station_info.city}, ${data.station_info.state}
            `;
        };

        infoWindow.setContent(contentString);
        infoWindow.setPosition(event.latLng);
        infoWindow.open(map);
    };

    function init() {
        const placeForm = document.getElementById('place');
        placeForm.addEventListener('submit', queryAddress);
        window.initMap = initMap;
    };

    init();
})();
