navigator.geolocation.getCurrentPosition(function(position) {
  var currentLat = position.coords.latitude;
  var currentLng = position.coords.longitude;

  // Create the map
  var map = L.map('map').setView([currentLat, currentLng], 13);

  // Add the OpenStreetMap tile layer
  L.tileLayer('https://%7Bs%7D.tile.openstreetmap.org/%7Bz%7D/%7Bx%7D/%7By%7D.png', {
    attribution: 'Map data © OpenStreetMap contributors'
  }).addTo(map);

  // Create markers for current position and destination
  var currentMarker = L.marker([currentLat, currentLng]).addTo(map);
  var destinationMarker = L.marker([destinationLat, destinationLng]).addTo(map);

  // Create a routing control instance
  var routingControl = L.Routing.control({
    waypoints: [
      L.latLng(currentLat, currentLng),
      L.latLng(destinationLat, destinationLng)
    ],
    routeWhileDragging: true
  }).addTo(map);

  // Fit the map bounds to include both markers
  var bounds = L.latLngBounds([currentMarker.getLatLng(), destinationMarker.getLatLng()]);
  map.fitBounds(bounds);
});
async function getRaceLobby(){
  return fetch("/getRaceData")
    .then((response)=>response.json())
    .then((data)=>{
      console.log(data)
    }).catch((error)=>
    {
      console.log(error);
    })

}
