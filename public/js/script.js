// Articles
function getArticles(take = 10, skip = 0) {
  return fetch(`/articles?take=${take}&skip=${skip}`)
    .then(response => response.json());
}

function getArticle(id) {
  return fetch(`/articles/${id}`)
    .then(response => response.json());
}

function postArticle(article) {
  return fetch('/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(article),
  })
    .then(response => response.json());
}

function updateArticle(id, article) {
  return fetch(`/articles/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(article),
  })
    .then(response => response.json());
}

function deleteArticle(id) {
  return fetch(`/articles/${id}`, {
    method: 'DELETE',
  })
    .then(response => response.status);
}

// Commentaires
function getCommentsCount(articleId) {
  return fetch(`/articles/${articleId}/comments/count`)
    .then(response => response.json())
    .then(data => data.count);
}

function getComments(articleId) {
  return fetch(`/commentaires/article/${articleId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    });
}

// Categories
function getCategories(take = 10, skip = 0) {
  return fetch(`/categories?take=${take}&skip=${skip}`)
    .then(response => response.json())
    .then(categories => {
      const getCategoryCountPromises = categories.map(category => {
        return getArticlesByCategory(category.id)
          .then(({ count }) => {
            category.count = count;
            return category;
          });
      });

      return Promise.all(getCategoryCountPromises);
    });
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
    .then(([data, countData]) => {
      const articles = data.articles.map(article => ({
        id: article.id,
        titre: article.titre,
        image: article.image,
        contenu: article.contenu,
        createdAt: article.createdAt,
        utilisateur: article.utilisateur,
        categories: article.categories,
      }));
      const count = countData.count;
      return { articles, count };
    });
}

// Fetch categories and display them
getCategories()
  .then(categories => {
    const categoriesContainer = document.querySelector('.cat');

    categories.forEach(category => {
      const categoryItem = document.createElement('li');
      categoryItem.className = 'nav-item';

      const categoryLink = document.createElement('a');
      categoryLink.className = 'nav-link d-flex justify-content-between';
      categoryLink.textContent = category.nom;
      categoryLink.href = '#'; // ajout d'un href
      categoryLink.addEventListener('click', function (e) {
        e.preventDefault();
        const activeLink = document.querySelector('.nav-link.active');
        if (activeLink) activeLink.classList.remove('active');
        categoryLink.classList.add('active');

        // Mise à jour de la div Accueil
        const accueilDiv = document.getElementById('Accueil');
        accueilDiv.querySelector('h1').textContent = category.nom;
        accueilDiv.querySelector('p').innerHTML = `<span class="mt-4">Il y a<span class="badge bg-light rounded-pill">${category.count}</span> articles dans<span class="badge bg-light rounded-pill">${category.nom}</span></span>`;

        // Fetching and displaying articles by category
        getArticlesByCategory(category.id, category.count, 0)
          .then(({ articles }) => {
            articlesContainer.innerHTML = '';
            row = document.createElement('div');
            row.className = 'row align-items-center g-4 CA';
            articlesContainer.appendChild(row);

            articlesOffset = 0;

            // Hide add article and load more buttons
            document.getElementById('addArticle').style.display = 'none';
            document.getElementById('load-more-button').style.display = 'none';

            // Display articles
            articles.forEach(article => {
              const articleCard = document.createElement('div');
              articleCard.className = 'card h-100 shadow rounded';

              const img = document.createElement('img');
              img.className = 'card-img-top';
              img.src = article.image || './images/alt.jpg';
              articleCard.appendChild(img);

              const cardBody = document.createElement('div');
              cardBody.className = 'card-body';

              const title = document.createElement('h5');
              title.className = 'card-title';
              title.textContent = article.titre;
              cardBody.appendChild(title);

              const author = document.createElement('h6');
              author.className = 'card-subtitle text-muted mt-1';
              author.innerHTML = article.utilisateur ? `<i class="bi bi-pencil-square"></i> Par <strong>${article.utilisateur.nom}</strong>` : '<strong>Par Anonymous</strong>';
              cardBody.appendChild(author);

              const date = document.createElement('p');
              date.className = 'card-text';
              date.innerHTML = `<i class="bi bi-calendar-minus"></i> Publié le ${new Date(article.createdAt).toLocaleDateString()}`;
              cardBody.appendChild(date);

              const content = document.createElement('p');
              content.className = 'card-text';
              content.textContent = article.contenu.substring(0, 100) + "...";
              cardBody.appendChild(content);

              getCommentsCount(article.id)
                .then(count => {
                  const comments = document.createElement('p');
                  comments.className = 'card-text';
                  comments.innerHTML = `<i class="bi bi-chat-dots"></i> ${count} commentaire(s)`;
                  cardBody.appendChild(comments);

                  const readMoreBtn = document.createElement('button');
                  readMoreBtn.className = 'btn btn-primary';
                  readMoreBtn.textContent = 'Lire la suite';
                  cardBody.appendChild(readMoreBtn);
                  readMoreBtn.addEventListener('click', () => {
                    getComments(article.id)
                      .then(comments => {
                        let commentsHTML = '';
                        if (comments.length === 0) {
                          commentsHTML = '<div><br>Aucun commentaire sur cet article</div>';
                        } else {
                          comments.forEach(comment => {
                            commentsHTML += `<div class="cmt"><strong>${comment.utilisateur ? comment.utilisateur.nom : 'Anonymous'}</strong>: ${comment.contenu}</div><hr>`;
                          });
                        }
                        Swal.fire({
                          title: article.titre,
                          customClass: 'LargeModal',
                          html: `
                            <img src="${article.image || './images/alt.jpg'}" class="img-fluid mb-3"> 
                            <p class="fontSize15">${article.contenu}</p>
                            <p class="text-muted">Publié le ${new Date(article.createdAt).toLocaleDateString()} | Par <span style="font-weight: bold;">${article.utilisateur ? article.utilisateur.nom : 'Anonymous'}</span></p>
                            <div>${article.categories ? article.categories.map(category => `<span class="badge rounded-pill bg-info" st> ${category.nom}</span>`).join('') : ''}</div>
                            <hr>
                            <h5 class="cmt2"><i class="bi bi-chat-dots"></i> Commentaires<span class="badge bg-secondary text-light" style="font-weight: lighter; margin-left: 5px;"> ${count}</span></h5><hr>
                            <div style="height: 150px; overflow-y: scroll;">${commentsHTML}</div>
                          `,
                          confirmButtonText: 'Fermer',
                        });
                      })
                      .catch(error => console.error('Erreur lors de la récupération des commentaires:', error));
                  });
                })
                .catch(error => console.error('Erreur :', error));

              articleCard.appendChild(cardBody);

              const cardColumn = document.createElement('div');
              cardColumn.className = 'col-lg-4 col-md-6';
              cardColumn.appendChild(articleCard);
              row.appendChild(cardColumn);
            });
          })
          .catch(error => console.error('Erreur :', error));
      });

      getArticlesByCategory(category.id)
        .then(({ count }) => {
          const numArticlesBadge = document.createElement('span');
          numArticlesBadge.className = 'badge bg-light rounded-pill';
          numArticlesBadge.textContent = count;

          categoryLink.appendChild(numArticlesBadge);
          categoryItem.appendChild(categoryLink);

          categoriesContainer.appendChild(categoryItem);
        })
        .catch(error => console.error('Erreur :', error));
    });
  })
  .catch(error => console.error('Erreur :', error));

// Articles
let articlesOffset = 0; // Décalage pour les articles suivants
let articlesContainer = document.getElementById('articles-container'); // Conteneur des articles
let row = document.createElement('div'); // Rangée actuelle
row.className = 'row align-items-center g-4 CA';
articlesContainer.appendChild(row);

// Fetch articles and render them
function fetchAndRenderArticles() {
  getArticles(10, articlesOffset)
    .then(articles => {
      articles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      articles.forEach((article, index) => {
        const articleCard = document.createElement('div');
        articleCard.className = 'card h-100 shadow rounded';

        const img = document.createElement('img');
        img.className = 'card-img-top';
        img.src = article.image || './images/alt.jpg';
        articleCard.appendChild(img);

        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        const title = document.createElement('h5');
        title.className = 'card-title';
        title.textContent = article.titre;
        cardBody.appendChild(title);

        const author = document.createElement('h6');
        author.className = 'card-subtitle text-muted mt-1';
        author.innerHTML = article.utilisateur ? `<i class="bi bi-pencil-square"></i> Par <strong>${article.utilisateur.nom}</strong>` : '<strong>Par Anonymous</strong>';
        cardBody.appendChild(author);

        const date = document.createElement('p');
        date.className = 'card-text';
        date.innerHTML = `<i class="bi bi-calendar-minus"></i> Publié le ${new Date(article.createdAt).toLocaleDateString()}`;
        cardBody.appendChild(date);

        const content = document.createElement('p');
        content.className = 'card-text';
        content.textContent = article.contenu.substring(0, 100) + "...";
        cardBody.appendChild(content);

        getCommentsCount(article.id)
          .then(count => {
            const comments = document.createElement('p');
            comments.className = 'card-text';
            comments.innerHTML = `<i class="bi bi-chat-dots"></i> ${count} commentaire(s)`;
            cardBody.appendChild(comments);

            const readMoreBtn = document.createElement('button');
            readMoreBtn.className = 'btn btn-primary';
            readMoreBtn.textContent = 'Lire la suite';
            cardBody.appendChild(readMoreBtn);
            readMoreBtn.addEventListener('click', () => {
              getComments(article.id)
                .then(comments => {
                  let commentsHTML = '';
                  if (comments.length === 0) {
                    commentsHTML = '<div><br>Aucun commentaire sur cet article</div>';
                  } else {
                    comments.forEach(comment => {
                      commentsHTML += `<div class="cmt"><strong>${comment.utilisateur ? comment.utilisateur.nom : 'Anonymous'}</strong>: ${comment.contenu}</div><hr>`;
                    });
                  }
                  Swal.fire({
                    title: article.titre,
                    customClass: 'LargeModal',
                    html: `
                      <img src="${article.image || './images/alt.jpg'}" class="img-fluid mb-3"> 
                      <p class="fontSize15">${article.contenu}</p>
                      <p class="text-muted">Publié le ${new Date(article.createdAt).toLocaleDateString()} | Par <span style="font-weight: bold;">${article.utilisateur ? article.utilisateur.nom : 'Anonymous'}</span></p>
                      <div>${article.categories ? article.categories.map(category => `<span class="badge rounded-pill bg-info" st> ${category.nom}</span>`).join('') : ''}</div>
                      <hr>
                      <h5 class="cmt2"><i class="bi bi-chat-dots"></i> Commentaires<span class="badge bg-secondary text-light" style="font-weight: lighter; margin-left: 5px;"> ${count}</span></h5><hr>
                      <div style="height: 150px; overflow-y: scroll;">${commentsHTML}</div>
                    `,
                    confirmButtonText: 'Fermer',
                  });
                })
                .catch(error => console.error('Erreur lors de la récupération des commentaires:', error));
            });
          })
          .catch(error => console.error('Erreur :', error));

        articleCard.appendChild(cardBody);

        const cardColumn = document.createElement('div');
        cardColumn.className = 'col-lg-4 col-md-6';
        cardColumn.appendChild(articleCard);

        row.appendChild(cardColumn);
      });

      articlesOffset += articles.length; // Incrémenter le décalage
    })
    .catch(error => console.error('Erreur :', error));
}

// Charger les articles initiaux
fetchAndRenderArticles();

// Écouter l'événement du bouton "Load More"
const loadMoreButton = document.getElementById('load-more-button');
loadMoreButton.addEventListener('click', () => {
  fetchAndRenderArticles();
});

document.querySelector('a.nav-link.active').addEventListener('click', function (e) {
  e.preventDefault();

  const activeLink = document.querySelector('.nav-link.active');
  if (activeLink) activeLink.classList.remove('active');
  this.classList.add('active');
  const accueilDiv = document.getElementById('Accueil');
  accueilDiv.querySelector('h1').textContent = 'Articles';
  accueilDiv.querySelector('p').textContent = 'Les dix derniers articles, triés par date de création';
  document.getElementById('addArticle').style.display = '';
  document.getElementById('load-more-button').style.display = '';
  // Clear articles container
  articlesContainer.innerHTML = '';
  row = document.createElement('div');
  row.className = 'row align-items-center g-4 CA';
  articlesContainer.appendChild(row);
  // Reset articles offset
  articlesOffset = 0;
  // Fetch and render articles as normal
  fetchAndRenderArticles();
})

// Add articles
document.querySelector("#addArticle").addEventListener('click', function (e) {
  if (document.querySelector("#check").value == "1")
    alert('1');
  else
    alert("display block");

})