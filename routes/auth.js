// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

router.post('/signup', async (req, res, next) => {
  try {
    const existingUser = await prisma.utilisateur.findUnique({
      where: {
        email: req.body.email
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10);

    const user = await prisma.utilisateur.create({
      data: {
        nom: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        role: 'AUTHOR'
      }
    });

    res.send(user);
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    console.log('Looking for user...');
    const user = await prisma.utilisateur.findUnique({ where: { email: req.body.email } });
    console.log('User found:', user);
    if (!user) {
      return res.status(400).json({ message: 'Invalid email' });
    }
    const isValidPassword = await bcrypt.compare(req.body.password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ id: user.id }, 'Secret@ELMOUADDIBE', { expiresIn: '1d' });
    res.send({ id: user.id, nom: user.nom, role: user.role, token: token });
  } catch (error) {
    console.log('Error occurred:', error);
    next(error);
  }
});

module.exports = router;