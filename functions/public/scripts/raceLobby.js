destinationLat = 0.0;
destinationLng = 0.0;

async function getCSRF() {
  return fetch("/csrf-token")
    .then((response) => response.json())
    .then((data) => {
      return data.csrfToken;
    });
}

let current_location;

const watchID = navigator.geolocation.watchPosition(async (position) => {
  current_location = position;
});

navigator.geolocation.getCurrentPosition(function (position) {
  var currentLat = position.coords.latitude;
  var currentLng = position.coords.longitude;

  // Create the map
  var map = L.map("map").setView([currentLat, currentLng], 13);

  // Add the OpenStreetMap tile layer
  L.tileLayer(
    "https://%7Bs%7D.tile.openstreetmap.org/%7Bz%7D/%7Bx%7D/%7By%7D.png",
    {
      attribution: "Map data © OpenStreetMap contributors",
    }
  ).addTo(map);

  // Create markers for current position and destination
  var currentMarker = L.marker([currentLat, currentLng]).addTo(map);
  var destinationMarker = L.marker([destinationLat, destinationLng]).addTo(map);

  // Create a routing control instance
  var routingControl = L.Routing.control({
    waypoints: [
      L.latLng(currentLat, currentLng),
      L.latLng(destinationLat, destinationLng),
    ],
    routeWhileDragging: true,
  }).addTo(map);

  // Fit the map bounds to include both markers
  var bounds = L.latLngBounds([
    currentMarker.getLatLng(),
    destinationMarker.getLatLng(),
  ]);
  map.fitBounds(bounds);
});

async function getRaceLobby() {
  return fetch("/getRaceData", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": getCSRF(),
    },
  })
    .then((response) => console.log(response))
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    })
    .catch((error) => {
      console.log(error);
    });
}

function checkIfRaceWon(lat, long, destLat, destLong) {
  const earthRadius = 3959; // Radius of the Earth in miles

  // Convert latitude and longitude to radians
  const latRad1 = toRadians(lat);
  const lonRad1 = toRadians(long);
  const latRad2 = toRadians(destLat);
  const lonRad2 = toRadians(destLong);

  // Calculate the differences between coordinates
  const deltaLat = latRad2 - latRad1;
  const deltaLon = lonRad2 - lonRad1;

  // Calculate the distance using the Haversine formula
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(latRad1) * Math.cos(latRad2) * Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadius * c;

  // Check if the distance is within 0.1 miles
  return distance <= 0.1;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

async function checkIfRaceLost(csrfToken) {
  return new Promise((resolve, reject) => {
    fetch("/checkRaceLost", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrfToken,
      },
    }).then((response) => {
      if (response.status == 200) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

async function sendWinRace() {
  await fetch("/winRace", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
  });
}

let currentlyCheckingRace = false;
let id = setInterval(async () => {
  if (currentlyCheckingRace) {
    return;
  }
  currentlyCheckingRace = true;
  let csrfToken = await getCSRF();
  let raceLost = await checkIfRaceLost(csrfToken);
  if (raceLost) {
    console.log("race lost womp womp");
    clearInterval(id);
    return;
  }
  let raceWon = checkIfRaceWon(
    current_location.latitude,
    current_location.longitude,
    0,
    0
  );
  if (raceWon) {
    console.log("you won!");
    await sendWinRace();
  }
}, 4000);
