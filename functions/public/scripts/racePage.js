async function getCSRF() {
  return fetch("/csrf-token")
    .then((response) => response.json())
    .then((data) => {
      return data.csrfToken;
    });
}

navigator.geolocation.getCurrentPosition((position) => {
  console.log("got", position);
});

let isSearchingForRacer = false;
let id = setInterval(async () => {
  if (isSearchingForRacer) {
    return;
  }
  isSearchingForRacer = true;
  let csrfToken = await getCSRF();
  console.log("got csrf");
  navigator.geolocation.getCurrentPosition(async (position) => {
    console.log("sending request");
    fetch("/findNearbyRacer", {
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
        isSearchingForRacer = false;
      })
      .catch((error) => {
        console.error(error);
        isSearchingForRacer = false;
      });
  });
}, 5000);

const watchID = navigator.geolocation.watchPosition(async (position) => {
  let csrfToken = await getCSRF();
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
