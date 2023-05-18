async function getCSRF() {
  return fetch("/csrf-token")
    .then((response) => response.json())
    .then((data) => {
      return data.csrfToken;
    });
}

console.log("hihihi");

document.querySelector("#submitlogin").onclick = async () => {
  let email = document.querySelector("#email").value;
  let password = document.querySelector("#password").value;
  let csrfToken = await getCSRF();

  fetch("/login", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "CSRF-Token": csrfToken,
    },
    body: JSON.stringify({
      email: email,
      password: password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      window.location.href = "/";
    })
    .catch((error) => {
      console.error(error);
    });
};
