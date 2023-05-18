async function getCSRF() {
  return fetch("/csrf-token")
    .then((response) => response.json())
    .then((data) => {
      return data.csrfToken;
    });
}
// const raceWatcher =navigator.geolocation.watchPosition(async(position)=>{
// let csrfToken = await getCSRF();
//   fetch('/raceData',{
//     method:'GET',
//     headers:{
//       "Consent-Type":"application/json",
//       "CSRF-Token": csrfToken,
//     },
//     body:JSON.stringify({
//       latitude: position.coords.latitude,
//       longitude: position.coords.longitude,
//     }),
//       .then((response)=>response.json())
//       .then((data)=>{
//         //screen update section
//       })
//       .catch((error)=>{
//         console.error(error);
//       });
//   });

// });
function updateRace(driver1,driver2){
  const statBoard=document.getElementById("statsBoard");
statBoard.innerHTML=`<table class="table"><thead><tr><th scope="col">place</th><th scope="col">name</th><th scope="col">speed</th></tr></thead> <tbody>
    <tr>
      <th scope="row">1</th>
      <td>${driver1}</td>
      <td>Otto</td>
    </tr>
    <tr>
      <th scope="row">2</th>
      <td>${driver2}</td>
      <td>Thornton</td>
    </tr>
      </tbody>
</table>`
}

const watchID = navigator.geolocation.watchPosition(async (position) => {
  let csrfToken = await getCSRF();
  updateRace(position.coords.latitude,position.coords.longitude);
  console.log(position.coords.latitude, position.coords.longitude);
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
