# Solar Map
Thinking of making the switch to renewable energy? Estimate if your location would be a hotspot for solar panels. Find out how much solar radiation your area gets within a few simple steps!

The project chooses not to use a front-end framework such as React or Angular because features available on framework versions of Google Maps API (such as React-Google-Maps) isn't always caught up with features availble on the Google Maps API itself.

## Instructions 
- Install http-server globally
    + https://www.npmjs.com/package/http-server
- Cd into project folder and 'http-server' in terminal.
- Open localhost:8080 in browser.
- Once the page is open, the first step is to search your address, city, or state in the searchbar.
- A polygon should appear over your entered location. Drag and edit the polygon to fit over the desired area.
- Click inside the polygon for information on estimated solar radiation over the selected area

## Tech Stack
- Google Maps API
- Google Places API
- National Renewal Energy Laboratory (NREL) API
    - NREL provided statistics for amount of solar radiation estimated for a certain area in kWh per specific month or per year, estimated by the nearest climate station 
    - NREL only provides data within the United States (including Alaska and Hawaii!)
