function createMap(circleMarkers) 
{
  // Create the tile layer to be bkgrnd map
  var lightmap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, " + 
    "<a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.light",
    accessToken: API_KEY
  });

  var darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, " + 
    "<a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.dark",
    accessToken: API_KEY
  });

  var satellitemap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"http://openstreetmap.org\">OpenStreetMap</a> contributors, " + 
    "<a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"http://mapbox.com\">Mapbox</a>",
    maxZoom: 20,
    id: "mapbox.satellite",
    accessToken: API_KEY
  });

  // Create baseMaps will hold the lightmap layer
  var baseMaps = {
    "Light": lightmap,
    "Dark": darkmap,
    "Satellite": satellitemap
  };

  // Create overlayMaps will hold the bikeStations layer
  var overlayMaps = {
    "Earthquakes": circleMarkers
  };

  // Create the map object 
  var map = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 7,
    layers: [lightmap, circleMarkers]
  });

  // Create a layer control, overlay with baseMaps and overlayMaps
  L.control.layers(baseMaps, overlayMaps, 
  {
    collapsed: false
  }).addTo(map);

  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {

      var div = L.DomUtil.create('div', 'info legend'),
          grades = [0, 1, 2, 3, 4, 5],
          labels = [];

      // loop through density intervals; generate label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor2(grades[i] + 1) + '"></i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
      }

      return div;
  };

  legend.addTo(map);

  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", function(data)
  {
    L.geoJSON(data).addTo(map);
  });
}

function createMarkers(response) 
{
  var locations = response.features;

  var circles = [];

  // Loop through array to create marker and circle
  for (let index = 0; index < locations.length; index++) 
  {
    let location = locations[index].geometry.coordinates;
    let mag = locations[index].properties.mag;
    let time = new Date(locations[index].properties.time);
    let place = locations[index].properties.place;

    var circle = L.circle([location[1], location[0]], 
    {
      color: 'black',
      weight: 1,
      fillColor: getColor(mag),
      fillOpacity: 0.9,
      radius: (mag * 15000)
    }).bindPopup("<h3>Earthquake: " + place + "<h3>Magnitude: " + mag + "<h3>Time: " + time.toString() + "<h3>");
    
    // Add the marker and circle
    circles.push(circle);
  }

  // Create a layer group to hold markers, pass with createMap function
  createMap(L.layerGroup(circles)); 
}

// create color scheme for ticks
function getColor(mag)
{
  if (mag >= 0 && mag < 1)
  {
    return "green";
  }
  if (mag >= 1 && mag < 2)
  {
    return "lightgreen";
  }
  if (mag >= 2 && mag < 3)
  {
    return "yellow";
  }
  if (mag >= 3 && mag < 4)
  {
    return "orange";
  }
  if (mag >= 4 && mag < 5)
  {
    return "#FD8D3C";
  }
  else
    return "red";
}

function getColor2(d) {
  return d > 5  ? 'red' :
         d > 4  ? '#FD8D3C' :
         d > 3   ? 'orange' :
         d > 2   ? 'yellow' :
         d > 1   ? 'lightgreen' :
                    'green';
}

// call into API. Call createMarkers when complete
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", createMarkers);