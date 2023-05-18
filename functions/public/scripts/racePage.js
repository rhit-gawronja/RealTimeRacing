const db=require('../../index.js')
const firestore= require("firebase/firestore");
function renderStats() {
  const board = document.getElementById("statsBoard");
  // TODO: Create js to load from firebase
  board.innerHTML = "hello";
  
  const statsRef=firestore.collection(db,"stats");
  console.log(statsRef)
}
