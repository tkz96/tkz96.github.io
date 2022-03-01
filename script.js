const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

//stay away from toggle in the future
hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});

// document.querySelectorAll(".nav-item").forEach(n => addEventListener("click", () => {
//     hamburger.classList.remove("active");
//     navMenu.classList.remove("active");
// }));