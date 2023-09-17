import { GLOBAL } from "/scripts/global.js";

function eventListenerFunctions() {
  GLOBAL.INDEX.allowDrop = function (ev) {
    ev.preventDefault();
  };

  function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }

  GLOBAL.INDEX.drop = function (ev) {
    ev.preventDefault();
    // console.log(ev);
    // console.log(ev.dataTransfer);
    // console.log(ev.dataTransfer.files[0]);
    // var data = ev.dataTransfer.getData("text");
    // console.log(data);

    const img = document.createElement("img");
    img.classList.add("imgs");
    img.setAttribute("src", URL.createObjectURL(ev.dataTransfer.files[0]));
    GLOBAL.ELEMENTS.dropBox.innerHTML = "";
    GLOBAL.ELEMENTS.dropBox.classList.remove("dropbox");
    GLOBAL.ELEMENTS.dropBox.classList.add("dropbox2");
    GLOBAL.ELEMENTS.dropBox.appendChild(img);

    GLOBAL.INDEX.file = ev.dataTransfer.files[0];
  };
}

async function sendData(e) {
  e.preventDefault();
  // console.log(GLOBAL.INDEX.file);
  let url = "/api/upload";
  let formData = new FormData();

  formData.append("file", GLOBAL.INDEX.file);

  const response = await fetch(url, { method: "POST", body: formData });
  const body = await response.json();
  console.log(body);
  const num = body[1] * 10000;
  GLOBAL.ELEMENTS.result.textContent = `${body[0]}, ${Math.round(num) / 100}%`;
}

function selectElements() {
  GLOBAL.ELEMENTS.dropBox = document.querySelector(".js-drop-area");
  GLOBAL.ELEMENTS.submit = document.querySelector("#submit-btn");
  GLOBAL.ELEMENTS.result = document.querySelector(".js-result-text");
  GLOBAL.ELEMENTS.fileContainer = document.querySelector("#file");
  // console.log(GLOBAL.ELEMENTS.dropBox);
}

function addEventListenersToElements() {
  GLOBAL.ELEMENTS.dropBox.addEventListener("dragover", GLOBAL.INDEX.allowDrop);
  GLOBAL.ELEMENTS.dropBox.addEventListener("drop", GLOBAL.INDEX.drop);
  GLOBAL.ELEMENTS.submit.addEventListener("click", sendData);
}

eventListenerFunctions();
selectElements();
addEventListenersToElements();
