//Articles
function getArticles(take = 10, skip = 0) {
  return fetch(`/articles?take=${take}&skip=${skip}`)
      .then(response => response.json())
      .catch(error => console.error('Error:', error));
}

function getArticle(id) {
  return fetch(`/articles/${id}`)
      .then(response => response.json())
      .catch(error => console.error('Error:', error));
}

function postArticle(article) {
  return fetch('/articles', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(article),
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error));
}

function updateArticle(id, article) {
  return fetch(`/articles/${id}`, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(article),
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error));
}

function deleteArticle(id) {
  return fetch(`/articles/${id}`, {
      method: 'DELETE',
  })
  .then(response => response.status)
  .catch(error => console.error('Error:', error));
}
// Commentaires
function getCommentaires(take = 10, skip = 0) {
  return fetch(`/commentaires?take=${take}&skip=${skip}`)
      .then(response => response.json())
      .catch(error => console.error('Error:', error));
}

function getCommentaire(id) {
  return fetch(`/commentaires/${id}`)
      .then(response => response.json())
      .catch(error => console.error('Error:', error));
}

function postCommentaire(commentaire) {
  return fetch('/commentaires', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentaire),
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error));
}

function updateCommentaire(id, commentaire) {
  return fetch(`/commentaires/${id}`, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentaire),
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error));
}

function deleteCommentaire(id) {
  return fetch(`/commentaires/${id}`, {
      method: 'DELETE',
  })
  .then(response => response.status)
  .catch(error => console.error('Error:', error));
}

// Categories
function getCategories(take = 10, skip = 0) {
  return fetch(`/categories?take=${take}&skip=${skip}`)
      .then(response => response.json())
      .catch(error => console.error('Error:', error));
}
function getCategorie(id) {
  return fetch(`/categories/${id}`)
      .then(response => response.json())
      .catch(error => console.error('Error:', error));
}

function postCategorie(categorie) {
  return fetch('/categories', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(categorie),
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error));
}

function updateCategorie(id, categorie) {
  return fetch(`/categories/${id}`, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(categorie),
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error));
}

function deleteCategorie(id) {
  return fetch(`/categories/${id}`, {
      method: 'DELETE',
  })
  .then(response => response.status)
  .catch(error => console.error('Error:', error));
}

// Users
function getUsers(take = 10, skip = 0) {
  return fetch(`/users?take=${take}&skip=${skip}`)
      .then(response => response.json())
      .catch(error => console.error('Error:', error));
}

function getUser(id) {
  return fetch(`/users/${id}`)
      .then(response => response.json())
      .catch(error => console.error('Error:', error));
}

function postUser(user) {
  return fetch('/users', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error));
}

function updateUser(id, user) {
  return fetch(`/users/${id}`, {
      method: 'PATCH',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
  })
  .then(response => response.json())
  .catch(error => console.error('Error:', error));
}

function deleteUser(id) {
  return fetch(`/users/${id}`, {
      method: 'DELETE',
  })
  .then(response => response.status)
  .catch(error => console.error('Error:', error));
}