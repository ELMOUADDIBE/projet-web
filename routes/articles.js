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

router.get('/:id/comments/count', async (req, res) => {
    const { id } = req.params;
    try {
        const count = await prisma.commentaire.count({ where: { articleId: +id } });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    const { titre, contenu, image, published, utilisateurId } = req.body;

    if (!utilisateurId) {
        return res.status(400).json({ error: 'utilisateurId is required' });
    }

    const user = await prisma.utilisateur.findUnique({ where: { id: utilisateurId } });

    if (!user) {
        return res.status(400).json({ error: `No user found with id ${utilisateurId}` });
    }

    try {
        const createdAt = new Date();
        const updatedAt = new Date();

        const article = await prisma.article.create({
            data: {
                titre,
                contenu,
                image,
                createdAt,
                updatedAt,
                published,
                utilisateurId,
            },
        });

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
            data: updatedArticle,
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