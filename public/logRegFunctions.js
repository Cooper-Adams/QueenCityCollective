const signUpButton = document.getElementById('signUp')
const signInButton = document.getElementById('signIn')
const container = document.getElementById('container')
const errorDiv = document.querySelector('.error-div')
const pwToggle = document.getElementById('pw-toggle')

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
	pwToggle.addEventListener("click", () => {
		const input = document.querySelector('input')

		console.log(input)
	
		if (input.type == 'password') {
			input.type = 'text'
		} else {
			input.type = 'password'
		}
	})
}
