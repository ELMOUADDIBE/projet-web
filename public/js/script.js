// Articles operations
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

// Commentaires operations
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

// Categories operations
function getCategories(take = 10, skip = 0) {
	return fetch(`/categories?take=${take}&skip=${skip}`)
		.then(response => response.json())
		.then(categories => {
			const getCategoryCountPromises = categories.map(category => {
				return getArticlesByCategory(category.id)
					.then(({
						count
					}) => {
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
			return {
				articles,
				count
			};
		});
}
//

// Fetch categories and display them
const categoriesContainer = document.querySelector('.cat');
getCategories()
	.then(categories => {
		categories.forEach(category => {
			const categoryItem = document.createElement('li');
			categoryItem.className = 'nav-item';

			const categoryLink = document.createElement('a');
			categoryLink.className = 'nav-link d-flex justify-content-between';
			categoryLink.id = `category-${category.id}`;
			categoryLink.textContent = category.nom;
			categoryLink.href = '#';

			categoryLink.addEventListener('click', function(e) {
				e.preventDefault();
				const activeLink = document.querySelector('.nav-link.active');
				if (activeLink) activeLink.classList.remove('active');
				categoryLink.classList.add('active');

				// Update div Accueil
				const accueilDiv = document.getElementById('Accueil');
				accueilDiv.querySelector('h1').textContent = category.nom;

				// Displaying articles by category
				getArticlesByCategory(category.id, category.count, 0)
					.then(({
						articles,
						count
					}) => {
						// Update the count in the Accueil div
						accueilDiv.querySelector('p').innerHTML = `<span class="mt-4">Il y a<span class="badge bg-light rounded-pill category-${category.nom} countCategory">${count}</span> articles dans<span class="badge bg-light rounded-pill">${category.nom}</span></span>`;

						getArticlesByCategory(category.id, category.count, 0)
							.then(({
								articles
							}) => {
								clearPage();
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
					})
					.catch(error => console.error('Erreur :', error));
			});

			getArticlesByCategory(category.id)
				.then(({
					count
				}) => {
					const numArticlesBadge = document.createElement('span');
					numArticlesBadge.className = 'badge bg-light rounded-pill countCategory';
					numArticlesBadge.textContent = count;

					categoryLink.appendChild(numArticlesBadge);
					categoryItem.appendChild(categoryLink);

					categoriesContainer.appendChild(categoryItem);
				})
				.catch(error => console.error('Erreur :', error));
		});
	})
	.catch(error => console.error('Erreur :', error));


// Articles Displaying process
let articlesOffset = 0;
let articlesContainer = document.getElementById('articles-container');
let row = document.createElement('div');
row.className = 'row align-items-center g-4 CA';
articlesContainer.appendChild(row);

// Fetch articles and render them
function fetchAndRenderArticles() {
	getArticles(10, articlesOffset)
		.then(articles => {
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

// Fct to clear Page
function clearPage(title, sub) {
	loadMoreButton.style.display = 'none';
	articlesContainer.innerHTML = '';
	row = document.createElement('div');
	row.className = 'row align-items-center g-4 CA';
	articlesContainer.appendChild(row);
	articlesOffset = 0;
	document.getElementById('mesArticlesDisplay').innerHTML = '';
	// Reaload category count
	getCategories().then(categories => {
		categories.forEach(category => {
			getArticlesByCategory(category.id)
				.then(({
					count
				}) => {
					const categoryLink = document.querySelector(`#category-${category.id}`);
					const numArticlesBadge = categoryLink.querySelector('.countCategory');
					numArticlesBadge.textContent = count;
					const accueilDiv = document.getElementById('Accueil');
					const accueilCountBadge = accueilDiv.querySelector(`.category-${category.nom}.countCategory`);
					if (title != undefined || sub != undefined) {
						accueilDiv.querySelector('h1').textContent = title;
						accueilDiv.querySelector('p').textContent = sub;
					}
					if (accueilCountBadge) {
						accueilCountBadge.textContent = count;
					}
				})
		});
	})
}

// Add article button
let uid = parseInt(document.querySelector("#check").value, 10);
document.querySelector("#addArticle").addEventListener('click', async function(e) {
	if (document.querySelector("#check").value == "1") {
		Swal.fire({
			icon: 'error',
			title: 'Erreur',
			text: 'Vous devez être connecté pour faire cette action.',
		});
	} else {
		var myModal = new bootstrap.Modal(document.getElementById('addArticleModal'), {});
		myModal.show();
		const categories = await getCategories();
		const categoriesDiv = document.querySelector('#addArticleForm #categories');
		categories.forEach(category => {
			const checkboxDiv = document.createElement('div');
			checkboxDiv.className = 'form-check-inline';

			const checkbox = document.createElement('input');
			checkbox.type = 'checkbox';
			checkbox.value = category.id;
			checkbox.id = 'category-' + category.id;
			checkbox.name = 'categories';
			checkbox.className = 'form-check-input';

			const label = document.createElement('label');
			label.htmlFor = 'category-' + category.id;
			label.textContent = category.nom;
			label.className = 'form-check-label';

			checkboxDiv.appendChild(checkbox);
			checkboxDiv.appendChild(label);

			categoriesDiv.appendChild(checkboxDiv);
		});

		const userInfo = await getUserInfo(Number(document.getElementById('check').value));
		document.querySelector('#addArticleForm input[name="utilisateur"]').value = userInfo.nom;
		document.querySelector('#addArticleForm input[name="utilisateurId"]').value = Number(document.getElementById('check').value);
	}
});

document.querySelector("#addArticleForm").addEventListener('submit', function(e) {
	e.preventDefault();

	const formData = new FormData(e.target);
	let data = Object.fromEntries(formData);
	data.utilisateurId = Number(data.utilisateurId);
	data.published = data.published === 'on';

	const categoriesDiv = document.querySelector('#addArticleForm #categories');
	data.categories = Array.from(categoriesDiv.querySelectorAll('input[name="categories"]:checked')).map(checkbox => Number(checkbox.value));
	delete data.utilisateur;

	postArticle(data)
		.then(article => {
			console.log('Article créé:', article);
			reloadPage();
			var myModal = bootstrap.Modal.getInstance(document.getElementById('addArticleModal'));
			myModal.hide();
			Swal.fire({
				icon: 'success',
				title: 'Succès',
				text: 'L\'article a été créé avec succès.',
			});
		})
		.catch(error => {
			console.error('Erreur lors de la création de l\'article:', error);
		});
});

// Load More Article button
const loadMoreButton = document.getElementById('load-more-button');
loadMoreButton.addEventListener('click', () => {
	fetchAndRenderArticles();
});

document.querySelector('a.nav-link.active').addEventListener('click', function(e) {
	e.preventDefault();

	const activeLink = document.querySelector('.nav-link.active');
	if (activeLink) activeLink.classList.remove('active');
	this.classList.add('active');
	const accueilDiv = document.getElementById('Accueil');
	accueilDiv.querySelector('h1').textContent = 'Articles';
	accueilDiv.querySelector('p').textContent = 'Les dix derniers articles, triés par date de création';
	document.getElementById('addArticle').style.display = '';
	document.getElementById('load-more-button').style.display = '';
	reloadPage()
})

// The function to reload the page and display articles and update categories
function reloadPage() {
	clearPage();
	fetchAndRenderArticles();
	// Fetch all categories
	getCategories().then(categories => {
			categories.forEach(category => {
				getArticlesByCategory(category.id)
					.then(({
						count
					}) => {
						const categoryLink = document.querySelector(`#category-${category.id}`);
						const numArticlesBadge = categoryLink.querySelector('.countCategory');
						numArticlesBadge.textContent = count;
						const accueilDiv = document.getElementById('Accueil');
						const accueilCountBadge = accueilDiv.querySelector(`.category-${category.nom}.countCategory`);
						if (accueilCountBadge) {
							accueilCountBadge.textContent = count;
						}
					})
					.catch(error => console.error('Erreur lors de la récupération des articles par catégorie:', error));
			});
		})
		.catch(error => console.error('Erreur lors de la récupération des catégories:', error));
}

// Update Article process
async function openUpdateModal(article) {
	document.getElementById('updateArticleId').value = article.id;
	document.getElementById('updateTitre').value = article.titre;
	document.getElementById('updateImage').value = article.image;
	document.getElementById('updatePublished').checked = article.published;

	var updateModal = new bootstrap.Modal(document.getElementById('updateArticleModal'), {});
	updateModal.show();
}

document.querySelector("#updateArticleForm").addEventListener('submit', function(e) {
	e.preventDefault();
	const formData = new FormData(e.target);
	let data = Object.fromEntries(formData);
	data.published = data.published === 'on';
	data.contenu += "  -  Modifié le " + new Date().toLocaleString();
	delete data.utilisateur;
	const id = document.getElementById('updateArticleId').value;
	updateArticle(id, data)
		.then(updatedArticle => {
			console.log("Article mis à jour :", updatedArticle);
			loadUserArticles();

			var updateModal = bootstrap.Modal.getInstance(document.getElementById('updateArticleModal'));
			updateModal.hide();
			Swal.fire({
				icon: 'success',
				title: 'Succès',
				text: 'L\'article a été mis à jour avec succès.',
			});
		})
		.catch(error => {
			console.error("Erreur lors de la mise à jour de l'article :", error);
		});
});

// Update data table of user
async function loadUserArticles() {
	const userInfo = await getUserInfo(document.querySelector("#check").value);

	const tableBody = document.getElementById('articlesBody');
	tableBody.innerHTML = '';

	userInfo.articles.forEach(article => {
		const row = document.createElement('tr');

		const idCell = document.createElement('td');
		idCell.textContent = article.id;
		row.appendChild(idCell);

		const titleCell = document.createElement('td');
		titleCell.textContent = article.titre;
		row.appendChild(titleCell);

		const contentCell = document.createElement('td');
		contentCell.textContent = article.contenu;
		row.appendChild(contentCell);

		const pubCell = document.createElement('td');
		if (article.published)
			pubCell.innerHTML = '<span class="badge rounded-pill bg-success">Oui</span>';
		else
			pubCell.innerHTML = '<span class="badge rounded-pill bg-false">Non</span>';
		row.appendChild(pubCell);

		const dateCell = document.createElement('td');
		dateCell.textContent = new Date(article.createdAt).toLocaleString();
		row.appendChild(dateCell);

		const operationsCell = document.createElement('td');

		const updateButton = document.createElement('button');
		updateButton.classList.add('btn', 'btn-primary', 'me-2');
		updateButton.innerHTML = '<i class="bi bi-pencil-fill"></i>';
		updateButton.addEventListener('click', () => openUpdateModal(article));
		operationsCell.appendChild(updateButton);

		const deleteButton = document.createElement('button');
		deleteButton.classList.add('btn', 'btn-danger');
		deleteButton.innerHTML = '<i class="bi bi-trash"></i>';
		deleteButton.addEventListener('click', async () => {
			const confirmation = await Swal.fire({
				title: 'Êtes-vous sûr de vouloir supprimer cet article?',
				icon: 'warning',
				showCancelButton: true,
				confirmButtonText: 'Oui, supprimer',
				cancelButtonText: 'Non, annuler'
			});

			if (confirmation.isConfirmed) {
				await deleteArticle(article.id);
				await loadUserArticles();
			}
		});
		operationsCell.appendChild(deleteButton);

		row.appendChild(operationsCell);

		tableBody.appendChild(row);
	});

	// Initialise DataTables
	$('#articlesTable').DataTable();
}

// Mes articles process
document.querySelector("#mesArticles").addEventListener('click', async function(e) {
	let check = document.querySelector("#check").value
	if (check == '1') {
		Swal.fire({
			icon: 'error',
			title: 'Erreur',
			text: 'Vous devez être connecté pour faire cette action.',
		});
	} else {
		clearPage('Mes articles', 'Explorations et réflexions : ma collection personnelle d\'articles');
		document.getElementById("mesArticlesDisplay").innerHTML = '<div class="row"> <div class="col-12"><table id="articlesTable" class="table table-striped table-bordered bg-light text-dark"><thead><tr><th>ID Article</th><th>Titre</th><th>Contenu</th><th>Publiée</th><th>Date de création</th><th>Opérations</th></tr></thead><tbody id="articlesBody"><!-- Les lignes de tableau seront générées ici par JavaScript --></tbody></table></div></div>';
		loadUserArticles();
	}
});

// Initialise the main page
fetchAndRenderArticles();