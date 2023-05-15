const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/', async (req, res) => {
    const { take, skip } = req.query;
    const articles = await prisma.article.findMany({ take: +take || 10, skip: +skip || 0 });
    res.json(articles);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const article = await prisma.article.findUnique({ where: { id: +id } });
        if (!article) return res.status(404).json({ error: 'Article not found' });
        res.json(article);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
  const newArticle = req.body;
  
  if (!newArticle.utilisateurId) {
      return res.status(400).json({ error: 'utilisateurId is required' });
  }

  const user = await prisma.utilisateur.findUnique({ where: { id: newArticle.utilisateurId } });

  if (!user) {
      return res.status(400).json({ error: `No user found with id ${newArticle.utilisateurId}` });
  }

  try {
      const article = await prisma.article.create({ data: newArticle });
      res.json(article);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedArticle = req.body;

    try {
        const article = await prisma.article.update({ 
            where: { id: +id },
            data: updatedArticle
        });
        res.json(article);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.article.delete({ where: { id: +id } });
        res.json({ message: `Article with id ${id} deleted.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;