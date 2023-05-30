const newBtn = document.getElementById("newTagBtn")
const closeBtn = document.querySelector("[data-close-modal]")
const submitBtn = document.querySelector("[data-submit-modal]")
const deleteBtns = document.querySelectorAll(".tagBtn")
const modal = document.querySelector("[data-modal]")
const input = document.querySelector(".modalInput")
const tags = document.getElementById("tags")

newBtn.addEventListener("click", () => { modal.showModal() })

closeBtn.addEventListener("click", () => { modal.close() })

submitBtn.addEventListener("click", () => {
    const newTag = document.createElement("div")
    newTag.classList.add("tag")

    const newTagBtn = document.createElement("button")
    newTagBtn.classList.add("tagBtn")
    newTagBtn.textContent = '✖';
    newTagBtn.setAttribute('type', "button")
    newTagBtn.setAttribute('id', 'tagBtn')
    newTagBtn.addEventListener("click", (e) => {tags.removeChild(e.target.parentElement)})

    const newTagInput = document.createElement("input")
    newTagInput.setAttribute('type', "text")
    newTagInput.setAttribute('value', input.value)
    newTagInput.setAttribute('name', "tags[]")

    newTag.appendChild(newTagInput)
    newTag.appendChild(newTagBtn)

    tags.appendChild(newTag)

    modal.close()
})

deleteBtns.forEach(button => button.addEventListener("click", (e) => {tags.removeChild(e.target.parentElement)}))

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

window.addEventListener('beforeunload', function (e) {
    e.preventDefault();
    e.returnValue = '';
});