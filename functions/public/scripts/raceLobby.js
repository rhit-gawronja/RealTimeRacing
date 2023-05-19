let destinationLat = 39.472298;
let destinationLng = -87.401917;

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

async function setupMap() {
  await getRaceLobby();

  navigator.geolocation.getCurrentPosition(function (position) {
    var currentLat = position.coords.latitude;
    var currentLng = position.coords.longitude;

    // Create the map
    var map = L.map("map").setView([currentLat, currentLng], 15);
    mapStr = `https://tile.openstreetmap.org/{z}/{x}/{y}.png`;
    // Add the OpenStreetMap tile layer
    L.tileLayer(mapStr, {
      attribution: "Map data © OpenStreetMap contributors",
    }).addTo(map);

    // Create markers for current position and destination
    var currentMarker = L.marker([currentLat, currentLng]).addTo(map);
    var destinationMarker = L.marker([destinationLat, destinationLng]).addTo(
      map
    );

    console.log("LatStart: " + currentLat + "lonStart:" + currentLng);
    console.log("LatEnd: " + destinationLat + "lonEnd:" + destinationLng);
    // Create a routing control instance
    var routingControl = L.Routing.control({
      waypoints: [
        L.latLng(currentLat, currentLng),
        L.latLng(destinationLat, destinationLng),
      ],
      router: L.Routing.mapbox(
        "sk.eyJ1IjoiZ2F3cm9uamEiLCJhIjoiY2xodHF5cnFxMzh3MzNycWtqYnVlajVucyJ9.Dj3AELyPknstTxq_hw7Lgg"
      ),
      routeWhileDragging: true,
    }).addTo(map);

    // Fit the map bounds to include both markers
    var bounds = L.latLngBounds([
      currentMarker.getLatLng(),
      destinationMarker.getLatLng(),
    ]);
    map.fitBounds(bounds);
  });
}

function lon2tile(lon, zoom) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat, zoom) {
  return Math.floor(
    ((1 -
      Math.log(
        Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
      ) /
        Math.PI) /
      2) *
      Math.pow(2, zoom)
  );
}

async function getRaceLobby() {
  return new Promise(async (resolve, reject) => {
    let csrf = await getCSRF();
    fetch("/getRaceData", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "CSRF-Token": csrf,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        destinationLat = data.location.latitude;
        destinationLng = data.location.longitude;
        resolve();
      })
      .catch((error) => {
        console.log(error);
        reject();
      });
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
  let csrfToken = await getCSRF();
  await fetch("/winRace", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
  });
}

setupMap();

let currentlyCheckingRace = false;
let id = setInterval(async () => {
  if (currentlyCheckingRace) {
    return;
  }
  console.log("checking shit");
  currentlyCheckingRace = true;
  let csrfToken = await getCSRF();
  let raceLost = await checkIfRaceLost(csrfToken);
  if (raceLost) {
    console.log("race lost womp womp");
    document.querySelector("#lossdiv").hidden = false;

    clearInterval(id);
    return;
  }
  let raceWon = checkIfRaceWon(
    current_location.coords.latitude,
    current_location.coords.longitude,
    destinationLat,
    destinationLng
  );

  if (raceWon) {
    clearInterval(id);
    await sendWinRace();
    document.querySelector("#windiv").hidden = false;
  } else {
    console.log(
      current_location.coords.latitude,
      current_location.coords.longitude,
      destinationLat,
      destinationLng
    );
  }
  currentlyCheckingRace = false;
}, 4000);
