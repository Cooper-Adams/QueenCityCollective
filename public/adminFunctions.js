const newBtn = document.getElementById("newTagBtn")
const closeBtn = document.querySelector("[data-close-modal]")
const submitBtn = document.querySelector("[data-submit-modal]")
const modal = document.querySelector("[data-modal]")
const input = document.querySelector(".modalInput")

newBtn.addEventListener("click", () => { modal.showModal() })

closeBtn.addEventListener("click", () => { modal.close() })

submitBtn.addEventListener("click", () => {
    //Add a new tag div with the input.value

    modal.close()
})

modal.addEventListener("click", e => {
    const modalDimensions = modal.getBoundingClientRect()
    if (
        e.clientX < modalDimensions.left ||
        e.clientX > modalDimensions.right ||
        e.clientY < modalDimensions.top ||
        e.clientY > modalDimensions.bottom
    ) {
        modal.close()
    }
})