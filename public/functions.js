const slidesContainer = document.getElementById("slides-container")
const slide = document.querySelectorAll(".slide")
const prevButtons = document.querySelectorAll(".left")
const nextButtons = document.querySelectorAll(".right")

//Resets the carousel to the beginning if page is refreshed
slidesContainer.scrollLeft = 0

//Always start at slide #1
let currentSlide = 1

//If user changes screen size, the current slide will stay visible
window.addEventListener("resize", (event) => { 
  slidesContainer.scrollLeft = document.getElementById(currentSlide).offsetLeft
})

//Moves the carousel slide to the left while maintaining boundaries
prevButtons.forEach(button => {
  button.addEventListener('click', event => {
    if ((currentSlide - 1) == 0)
    {
      currentSlide = 4
      slidesContainer.scrollLeft = document.getElementById(currentSlide).offsetLeft
    }
    
    else
    {
      currentSlide--
      slidesContainer.scrollLeft = document.getElementById(currentSlide).offsetLeft
    }
  })
})

//Moves the carousel slide to the right while maintaining boundaries
nextButtons.forEach(button => {
  button.addEventListener('click', event => {
    if ((currentSlide + 1) == 5) {
      currentSlide = 1
      slidesContainer.scrollLeft = 0
    } else {
      currentSlide++
      slidesContainer.scrollLeft = document.getElementById(currentSlide).offsetLeft
    }
  })
})

const burger = document.querySelector(".burger")
const nav = document.querySelector(".nav-links")
const navLinks = document.querySelectorAll(".nav-links a")

burger.addEventListener("click", () => {
  if (burger.classList.contains("hornets")) {
    nav.classList.toggle("nav-active")
    nav.classList.toggle("hornets")
  } else {
    nav.classList.toggle("nav-active")
  }

  navLinks.forEach((link, index) => {
    if (link.style.animation) {
      link.style.animation = ""
    } else {
      link.style.animation = `navLinkFade 0.5s ease forwards ${
        index / 7 + 0.5
      }s `
    }
  })
  
  burger.classList.toggle("toggle")
})