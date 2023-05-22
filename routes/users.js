const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const router = express.Router();

router.get('/', async (req, res) => {
    const { take, skip } = req.query;
    const users = await prisma.utilisateur.findMany({ take: +take || 10, skip: +skip || 0 });
    res.json(users);
});

router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.utilisateur.findUnique({ where: { id: +id }, select: { nom: true, role: true } });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/', async (req, res) => {
    const newUser = req.body;
    try {
        const user = await prisma.utilisateur.create({ data: newUser });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.patch('/:id', async (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;

    try {
        const user = await prisma.utilisateur.update({
            where: { id: +id },
            data: updatedUser
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.utilisateur.delete({ where: { id: +id } });
        res.json({ message: `User with id ${id} deleted.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;