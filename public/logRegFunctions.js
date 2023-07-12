const signUpButton = document.getElementById('signUp')
const signInButton = document.getElementById('signIn')
const container = document.getElementById('container')
const errorDiv = document.querySelector('.error-div')

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active")
})

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active")
})

setTimeout(function() {
	errorDiv.classList.add('hidden')
}, 2000);