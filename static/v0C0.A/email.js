console.log("init module email begin"); //--use import.meta.url
import {showAlert} from "./base.js";

//...
const ea1="brn.lst", ea2="nbrgr@gm", ea3="ail.c", ea4 = "om";

// ui elements
const uiF1 = document.getElementById("F1");
const uiF2 = document.getElementById("F2");
const uiShow = document.getElementById("show");
const uiEmail = document.getElementById("email")

// event handlers
document.addEventListener('click', handleShow);
document.addEventListener('DOMContentLoaded', handlePageLoaded);

// show
function handleShow(e) {
  const t = e.target;
  if (t.id === "show") {
    if (uiF1.value.toLowerCase() === "flask" &&
        uiF2.value.toLowerCase() === "bootstrap")  {
      uiEmail.value = ea1 + ea2 + ea3 + ea4;
    } else {
      showAlert("No!", "Lookup the answer in About.");
    }
  }
}

function handlePageLoaded() {
  //nothing
}

console.log("init module email end");
