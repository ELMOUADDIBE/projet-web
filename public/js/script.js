//Login form
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

// Articles
function getArticles(take = 10, skip = 0) {
  return fetch(`/articles?take=${take}&skip=${skip}`)
    .then(response => response.json())
    .catch(error => console.error('Erreur :', error));
}

function getArticle(id) {
  return fetch(`/articles/${id}`)
    .then(response => response.json())
    .catch(error => console.error('Erreur :', error));
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
    .catch(error => console.error('Erreur :', error));
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
    .catch(error => console.error('Erreur :', error));
}

function deleteArticle(id) {
  return fetch(`/articles/${id}`, {
    method: 'DELETE',
  })
    .then(response => response.status)
    .catch(error => console.error('Erreur :', error));
}

// Commentaires
function getCommentsCount(articleId) {
  return fetch(`/articles/${articleId}/comments/count`)
    .then(response => response.json())
    .then(data => data.count)
    .catch(error => console.error('Erreur :', error));
}

// Categories
function getCategories(take = 10, skip = 0) {
  return fetch(`/categories?take=${take}&skip=${skip}`)
    .then(response => response.json())
    .catch(error => console.error('Erreur :', error));
}

function getArticlesByCategory(categoryId, take = 10, skip = 0) {
  return Promise.all([
    fetch(`/categories/${categoryId}/articles?take=${take}&skip=${skip}`),
    fetch(`/categories/${categoryId}/articles/count`)
  ])
    .then(([articlesResponse, countResponse]) => {
      if (!articlesResponse.ok || !countResponse.ok) {
        throw new Error('Erreur lors de la récupération des articles');
      }
      return Promise.all([articlesResponse.json(), countResponse.json()]);
    })
    .then(([articles, count]) => ({ articles, count: count.count }))
    .catch(error => console.error('Erreur :', error));
}

// Fetch categories and display them
getCategories()
  .then(categories => {
    const categoriesContainer = document.getElementById('categories-container');

    categories.forEach(category => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'category';

      const name = document.createElement('h4');
      name.textContent = category.nom;
      categoryDiv.appendChild(name);

      getArticlesByCategory(category.id)
        .then(({ count }) => {
          const numArticles = count;

          const numArticlesText = document.createElement('p');
          numArticlesText.textContent = `Nombre d'articles : ${numArticles}`;
          categoryDiv.appendChild(numArticlesText);

          categoriesContainer.appendChild(categoryDiv);
        })
        .catch(error => console.error('Erreur :', error));
    });
  })
  .catch(error => console.error('Erreur :', error));

// Fetch articles
getArticles()
  .then(articles => {
    // Sort articles by date of publication, most recent first
    articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Take the first 10 articles
    const recentArticles = articles.slice(0, 10);

    // Display the articles
    const articlesContainer = document.getElementById('articles-container');

    recentArticles.forEach(article => {
      const articleCard = document.createElement('div');
      articleCard.className = 'card mb-3';

      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';

      const title = document.createElement('h5');
      title.className = 'card-title';
      title.textContent = article.titre;
      cardBody.appendChild(title);

      const content = document.createElement('p');
      content.className = 'card-text';
      content.textContent = article.contenu.substring(0, 100) + "..."; // Display the first 100 characters
      cardBody.appendChild(content);

      const date = document.createElement('p');
      date.className = 'card-text';
      date.textContent = `Publié le ${new Date(article.createdAt).toLocaleDateString()}`;
      cardBody.appendChild(date);

      // Fetch the comments count for the article
      getCommentsCount(article.id)
        .then(count => {
          const comments = document.createElement('p');
          comments.className = 'card-text';
          comments.textContent = `${count} commentaire(s)`;
          cardBody.appendChild(comments);
        })
        .catch(error => console.error('Error:', error));

      const readMoreBtn = document.createElement('a');
      readMoreBtn.className = 'btn btn-primary';
      readMoreBtn.href = `/articles/${article.id}`;
      readMoreBtn.textContent = 'Lire la suite';
      cardBody.appendChild(readMoreBtn);

      articleCard.appendChild(cardBody);
      articlesContainer.appendChild(articleCard);
    });
  })
  .catch(error => console.error('Error:', error));