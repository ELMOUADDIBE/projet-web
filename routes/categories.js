const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/', async (req, res) => {
  const { take, skip } = req.query;
  const categories = await prisma.categorie.findMany({ take: +take || 10, skip: +skip || 0 });
  res.json(categories);
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const categorie = await prisma.categorie.findUnique({ where: { id: +id } });
    if (!categorie) return res.status(404).json({ error: 'Categorie not found' });
    res.json(categorie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/articles', async (req, res) => {
  const { id } = req.params;
  const { take, skip } = req.query;

  try {
    const articles = await prisma.article.findMany({
      where: {
        categories: {
          some: {
            id: +id,
          },
        },
        published: true,
      },
      include: {
        utilisateur: true,
        categories: true,
      },
      take: +take || 10,
      skip: +skip || 0,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const count = await prisma.article.count({
      where: {
        categories: {
          some: {
            id: +id,
          },
        },
        published: true,
      },
    });

    if (!articles) return res.status(404).json({ error: 'No articles found for this category' });

    const formattedArticles = articles.map(article => ({
      id: article.id,
      titre: article.titre,
      image: article.image,
      contenu: article.contenu,
      createdAt: article.createdAt,
      utilisateur: article.utilisateur,
      categories: article.categories,
    }));

    res.json({ articles: formattedArticles, count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/articles/count', async (req, res) => {
  const { id } = req.params;
  try {
    const count = await prisma.article.count({
      where: {
        categories: {
          some: {
            id: +id,
          },
        },
      },
    });
    res.json({ count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  const newCategorie = req.body;

  if (!newCategorie.utilisateurId) {
    return res.status(400).json({ error: 'utilisateurId is required' });
  }

  const user = await prisma.utilisateur.findUnique({ where: { id: newCategorie.utilisateurId } });

  if (!user) {
    return res.status(400).json({ error: `No user found with id ${newCategorie.utilisateurId}` });
  }

  try {
    const categorie = await prisma.categorie.create({ data: newCategorie });
    res.json(categorie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const updatedCategorie = req.body;

  try {
    const categorie = await prisma.categorie.update({
      where: { id: +id },
      data: updatedCategorie
    });
    res.json(categorie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.categorie.delete({ where: { id: +id } });
    res.json({ message: `Categorie with id ${id} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;