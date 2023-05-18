destinationLat=0.0
destinationLng=0.0

async function getCSRF() {
  return fetch("/csrf-token")
    .then((response) => response.json())
    .then((data) => {
      return data.csrfToken;
    });
}
csrf=getCSRF();
function lon2tile(lon,zoom) { return (Math.floor((lon+180)/360*Math.pow(2,zoom))); }
 function lat2tile(lat,zoom)  { return (Math.floor((1-Math.log(Math.tan(lat*Math.PI/180) + 1/Math.cos(lat*Math.PI/180))/Math.PI)/2 *Math.pow(2,zoom))); }
navigator.geolocation.getCurrentPosition(function(position) {
  var currentLat = position.coords.latitude;
  var currentLng = position.coords.longitude;

  // Create the map
  var map = L.map('map').setView([currentLat, currentLng], 10);
	mapStr=`https://tile.openstreetmap.org/15/${lon2tile(currentLng,15)}/${lat2tile(currentLat,15)}.png`
  // Add the OpenStreetMap tile layer
  L.tileLayer(mapStr, {
    attribution: 'Map data © OpenStreetMap contributors'
  }).addTo(map);

  // Create markers for current position and destination
  var currentMarker = L.marker([currentLat, currentLng]).addTo(map);
  var destinationMarker = L.marker([destinationLat, destinationLng]).addTo(map);

  console.log('LatStart: '+currentLat+'lonStart:'+currentLng)
  console.log('LatEnd: '+destinationLat+'lonEnd:'+destinationLng)
  // Create a routing control instance
  var routingControl = L.Routing.control({
    waypoints: [
      L.latLng(currentLat, currentLng),
      L.latLng(destinationLat, destinationLng)

    ],
    router: L.Routing.mapbox('sk.eyJ1IjoiZ2F3cm9uamEiLCJhIjoiY2xodHF5cnFxMzh3MzNycWtqYnVlajVucyJ9.Dj3AELyPknstTxq_hw7Lgg'),
    routeWhileDragging: true
  }).addTo(map);

  // Fit the map bounds to include both markers
  var bounds = L.latLngBounds([currentMarker.getLatLng(), destinationMarker.getLatLng()]);
  map.fitBounds(bounds);
});
async function getRaceLobby(){
  return fetch("/getRaceData",{
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrf,
    },

  })
    .then((response)=>console.log(response))
    .then((data)=>{
      console.log(data)
    }).catch((error)=>
    {
      console.log(error);
    })

}
