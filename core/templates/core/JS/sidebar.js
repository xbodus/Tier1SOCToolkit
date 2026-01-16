const categories = document.getElementById("categories-container")

categories.addEventListener("click", function() {
    const options = categories.querySelector(".dropdown-content");
    options.classList.toggle("open");
});


const difficulties = document.getElementById("difficulties-container")

difficulties.addEventListener("click", function() {
    const options = difficulties.querySelector(".dropdown-content");
    options.classList.toggle("open");
});


const readTime = document.getElementById("read-time-container")

readTime.addEventListener("click", function() {
    const options = readTime.querySelector(".dropdown-content");
    options.classList.toggle("open");
});