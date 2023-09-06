const signUpButton = document.getElementById('signUp')
const signInButton = document.getElementById('signIn')
const container = document.getElementById('container')
const errorDiv = document.querySelector('.error-div')
const pwToggle = document.getElementsByClassName('pw-toggle')

if (signUpButton) {
	signUpButton.addEventListener('click', () => {
		container.classList.add("right-panel-active")
	})
}

if (signInButton) {
	signInButton.addEventListener('click', () => {
		container.classList.remove("right-panel-active")
	})
}

if (errorDiv) {
	setTimeout(function() {
		errorDiv.classList.add('hidden')
	}, 2000)
}

if (pwToggle) {
	Array.from(pwToggle).forEach(toggle => {
		toggle.addEventListener("click", () => {
			if (toggle.previousElementSibling.type == 'password') {
				toggle.previousElementSibling.type = 'text'
			} else {
				toggle.previousElementSibling.type = 'password'
			}
		})
	})	
}
