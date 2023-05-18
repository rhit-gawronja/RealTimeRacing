let current_location;

async function getCSRF() {
  return fetch("/csrf-token")
    .then((response) => response.json())
    .then((data) => {
      return data.csrfToken;
    });
}

let isSearchingForRacer = false;
let id = setInterval(async () => {
  if (isSearchingForRacer) {
    return;
  }
  isSearchingForRacer = true;
  let csrfToken = await getCSRF();
  console.log("got csrf");
  console.log("sending request");
  fetch("/findNearbyRacer", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
    body: JSON.stringify({
      latitude: current_location.coords.latitude,
      longitude: current_location.coords.longitude,
    }),
  })
    .then((response) => {
      if (response.status === 200) {
        setTimeout(() => {
          window.location.href = "/racelobby";
        }, 2000);
      }
      return response.json();
    })
    .then((data) => {
      console.log(data);
      isSearchingForRacer = false;
    })
    .catch((error) => {
      console.error(error);
      isSearchingForRacer = false;
    });
}, 3000);

const watchID = navigator.geolocation.watchPosition(async (position) => {
  let csrfToken = await getCSRF();
  console.log(position.coords.latitude, position.coords.longitude);
  current_location = position;
  fetch("/updateLocation", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
    body: JSON.stringify({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error(error);
    });
});
