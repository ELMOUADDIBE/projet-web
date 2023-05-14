const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/', async (req, res) => {
    const { take, skip } = req.query;
    const articles = await prisma.article.findMany({ take: +take, skip: +skip });
    res.json(articles);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const article = await prisma.article.findUnique({ where: { id: +id } });
    res.json(article);
});

router.post('/', async (req, res) => {
    const newArticle = req.body;
    const article = await prisma.article.create({ data: newArticle });
    res.json(article);
});

router.patch('/', async (req, res) => {
    const updatedArticle = req.body;
    const article = await prisma.article.update({ 
        where: { id: updatedArticle.id },
        data: updatedArticle
    });
    res.json(article);
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    await prisma.article.delete({ where: { id: +id } });
    res.json({ message: `Article with id ${id} deleted.` });
});

module.exports = router;
