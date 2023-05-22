//Login form
const signUpButton = document.getElementById('signUp2');
const signInButton = document.getElementById('signIn2');
const container = document.getElementById('container');

const signupForm = document.getElementById('signup-form');
const signinForm = document.getElementById('signin-form');
const authButton = document.getElementById('auth-button');
const logoutButton = document.getElementById('logout-button');
const invalidEmailMessage = document.getElementById('invalid-email');
const invalidPassMessage = document.getElementById('invalid-pass');
const emailUsedMessage = document.getElementById('email-used');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

function getUserInfo(id) {
	return fetch(`/users/${id}`)
		.then(response => response.json())
		.catch(error => console.error('Erreur :', error));
}

// Authentification
function signup(name, email, password) {
	return fetch('/auth/signup', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name,
				email,
				password
			}),
		})
		.then(response => response.json())
		.catch(error => console.error('Erreur :', error));
}

function login(email, password) {
	let errorMessage = 'Login failed';

	return fetch('/auth/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email,
				password
			})
		})
		.then(response => {
			if (!response.ok) {
				return response.json().then(data => {
					if (response.status === 400) {
						if (data.message === 'Invalid email') {
							errorMessage = 'Invalid email';
							invalidEmailMessage.style.display = 'block';
						} else if (data.message === 'Invalid password') {
							errorMessage = 'Invalid password';
							invalidPassMessage.style.display = 'block';
						} else if (data.message === 'Email already in use') {
							errorMessage = 'Email already in use';
							emailUsedMessage.style.display = 'block';
						}
					}
					throw new Error(errorMessage);
				});
			}
			return response.json();
		})
		.then(data => {
			if (data.token) { // Vérifier si la propriété token est présente dans la réponse
				console.log('User logged in, token:', data.token);
				return data;
			} else {
				errorMessage = 'Login failed: Token not found in the response';
				throw new Error(errorMessage);
			}
		})
		.catch(error => {
			throw error;
		});
}

function handleSignup(e) {
	e.preventDefault();
	const name = document.getElementById('signup-name').value;
	const email = document.getElementById('signup-email').value;
	const password = document.getElementById('signup-password').value;

	signup(name, email, password)
		.then(user => {
			console.log('SignUP:', user);
			if (user.message !== 'Email already in use') {
				container.classList.remove("right-panel-active");
				showSignupSuccessPopup(name);
			} else {
				emailUsedMessage.style.display = 'block';
			}
		})
		.catch(error => {
			console.error('Signup failed:', error);
		});
}

function handleSignin(e) {
	e.preventDefault();
	const email = document.getElementById('signin-email').value;
	const password = document.getElementById('signin-password').value;

	// Cacher les messages d'erreur dans le modal
	invalidEmailMessage.style.display = 'none';
	invalidPassMessage.style.display = 'none';

	login(email, password)
		.then(response => {
			console.log('Login success OK');
			// Fermer la fenêtre modale
			$('#loginModal').modal('hide');
			// Modifier la barre de navigation
			authButton.style.display = 'none';
			logoutButton.style.display = 'block';

			if (response.id) {
				const userId = response.id;

				// Récupérer les informations de l'utilisateur
				getUserInfo(userId)
					.then(userInfo => {
						console.log('LOGIN ID : ', userId);
						const {nom,role} = userInfo;
						showLoginSuccessPopup(nom);

						document.getElementById("check").value = userId;
						logoutButton.innerHTML = `<span class="fontSize15 text-light text-center"><i class="bi bi-person-circle"></i> ${nom}<br></span><i class="bi bi-pen"></i> ${role}<hr>Se déconnecter`;
					})
					.catch(error => {
						console.error('Failed to get user info:', error);
					});
			} else {
				console.log('No user ID found in the response');
			}
		})
		.catch(error => {
			console.error('Login failed:', error);
		});
}

signupForm.addEventListener('submit', handleSignup);
signinForm.addEventListener('submit', handleSignin);

// Fonction de déconnexion
function logout() {
	authButton.style.display = 'block';
	logoutButton.style.display = 'none';
	document.getElementById("check").value = '1';
}

logoutButton.addEventListener('click', logout);

// Modal d'erreur decoration
document.getElementById('forgot-password').addEventListener('click', function() {
	Swal.fire({
		title: 'Mot de passe oublié',
		text: 'Veuillez contacter l\'administration du site pour réinitialiser votre mot de passe.',
		icon: 'info',
		confirmButtonText: 'OK'
	});
});

function showLoginSuccessPopup(nom) {
	const cnx = Swal.mixin({
		toast: true,
		icon: 'success',
		title: 'Connecté avec succès',
		text: `${nom} a été connecté avec succès.`,
		animation: false,
		position: 'top-right',
		showConfirmButton: false,
		timer: 4000,
		timerProgressBar: true,
	});

	cnx.fire();
}

function showSignupSuccessPopup(nom) {
	const cnx = Swal.mixin({
		toast: true,
		icon: 'success',
		title: 'Compte créé avec succès',
		text: `Votre compte ${nom} a été créé avec succès.`,
		animation: false,
		position: 'top-right',
		showConfirmButton: false,
		timer: 4000,
		timerProgressBar: true,
	});

	cnx.fire();
}