const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/', async (req, res) => {
    const { take, skip } = req.query;
    const commentaires = await prisma.commentaire.findMany({ take: +take || 10, skip: +skip || 0 });
    res.json(commentaires);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const commentaire = await prisma.commentaire.findUnique({ where: { id: +id } });
        if (!commentaire) return res.status(404).json({ error: 'Commentaire not found' });
        res.json(commentaire);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    const newCommentaire = req.body;
    try {
        const commentaire = await prisma.commentaire.create({ data: newCommentaire });
        res.json(commentaire);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedCommentaire = req.body;

    try {
        const commentaire = await prisma.commentaire.update({ 
            where: { id: +id },
            data: updatedCommentaire
        });
        res.json(commentaire);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.commentaire.delete({ where: { id: +id } });
        res.json({ message: `Commentaire with id ${id} deleted.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
