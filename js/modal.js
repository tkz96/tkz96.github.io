/* eslint-disable linebreak-style */
import modalData from './modal-data.js';
const overlay = document.querySelector('#overlay');

document.querySelector('#close-modal-btn').addEventListener('click', () => {
  overlay.style.display = 'none';
});

document.querySelectorAll('.see-project').forEach((e) => {
  e.addEventListener('click', () => {
    overlay.style.display = 'block';
  });
});

function myFunction(i) {
  modalData[i];
}

// i is the button id
// modalData[i] -> fill up the modalsee-project
