const articleBtns = document.querySelectorAll(".newTagBtn")
const closeBtns = document.querySelectorAll("[data-close-modal]")
const modals = document.querySelectorAll("[data-modal]")

articleBtns.forEach(button => button.addEventListener("click", (e) => {
    modals[e.target.id].showModal()
}))

closeBtns.forEach(button => button.addEventListener("click", (e) => {
    modals[e.target.id].close()
}))

modals.forEach(modal => modal.addEventListener("click", (e) => {
    const modalDimensions = modal.getBoundingClientRect()
    if (
        e.clientX < modalDimensions.left ||
        e.clientX > modalDimensions.right ||
        e.clientY < modalDimensions.top ||
        e.clientY > modalDimensions.bottom
    ) {
        modal.close()
    }
}))