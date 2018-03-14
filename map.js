(function() {
    function initMap(coordinates, nrelData) {

        // default location the map falls on if passed in given coordinates
        var defaultLoc = {lat: 41.418793, lng: -75.680906};
        coordinates ? defaultLoc = {lat: coordinates[0], lng: coordinates[1]} : {lat: 41.418793, lng: -75.680906};

        window.map = new google.maps.Map(document.getElementById('map'), {
            zoom: 15,
            center: defaultLoc,
        });
        
        
        // create polygon
        var polygonCoords;
        //new polygon coords if new coordinates is entered. otherwise, default to no polygon (empty array)
        coordinates ? 
        polygonCoords = [
            {lat: coordinates[0], lng: coordinates[1]},
            {lat: coordinates[0] + .0005, lng: coordinates[1] + .0005},
            {lat: coordinates[0] - .0005, lng: coordinates[1] - .0005}
        ] 
        : polygonCoords = [];

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
        
        function showInfo(event) {
            let vertices = this.getPath(); // calls google maps method to retrieve polygon info
            let areaPath = []; // array will contain objects of the polygon's coordinates
            
            for(let i = 0; i < vertices.getLength(); i++) {
                areaPath.push(vertices.getAt(i));
            }
            
            let area = google.maps.geometry.spherical.computeArea(areaPath); // get the area of the drawn polygon
    
            // in case users select an area larger than a standard city, notify that accuracy may be off
            let instructionText = document.getElementById("search-result");
            if(area > 10000000) {
                instructionText.innerHTML = `please select a smaller area for better accuracy`;
            } 
    
            // retrieve the string and number of current month
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
            
            // if received nrelData fetched from Nrel api, add the additional information to contentString
            if(nrelData) {
                // Monthly solar radiation values in (kWh/m2/day) * selected Area in m^2 * number of days in that month
                const energyForCurrentMonth = Math.round(nrelData.outputs.solrad_monthly[currentMonthNum]*area*monthLength);
    
                // Annual solar radiation value in (kWh/m2/day) * selected Area * 365 days 
                const energyAnnual = Math.round(nrelData.outputs.solrad_annual*area*365);
    
                let contentString = `<b> Your selected area is </b><br></br> ${Math.round(area*100)/100} sq meters<br></br>
                Monthly solar radiation for selected area during ${currentMonthString}: ${energyForCurrentMonth} kWh <br>
                Annual solar radiation for selected area: ${energyAnnual} kWh<br>
                Information from closest climate station located in ${nrelData.station_info.city}, ${nrelData.station_info.state}
                `;

                infoWindow.setContent(contentString);
                infoWindow.setPosition(event.latLng);
                infoWindow.open(map)
            };
        };
    };

    window.initMap = initMap;
})();