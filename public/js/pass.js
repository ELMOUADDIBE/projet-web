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

// Authentification
function signup(name, email, password) {
  return fetch('/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, email, password }),
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
    body: JSON.stringify({ email, password })
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
          console.error(errorMessage);
        });
      }
      return response.json();
    })
    .then(data => {
      console.log('User logged in, token:', data.token);
      return data;
    })
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
      }
      else {
        emailUsedMessage.style.display = 'block';
      }
    })
}

function handleSignin(e) {
  e.preventDefault();
  const email = document.getElementById('signin-email').value;
  const password = document.getElementById('signin-password').value;

  // Cacher les messages d'erreur
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
    })
}

signupForm.addEventListener('submit', handleSignup);
signinForm.addEventListener('submit', handleSignin);

// Fonction de déconnexion
function logout() {
  authButton.style.display = 'block';
  logoutButton.style.display = 'none';
}

// Appel de la fonction logout lors du clic sur le bouton de déconnexion
logoutButton.addEventListener('click', logout);