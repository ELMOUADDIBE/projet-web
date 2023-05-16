const faker = require('faker/locale/ar');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  try {
    // Delete all existing data
    await prisma.commentaire.deleteMany();
    await prisma.article.deleteMany();
    await prisma.categorie.deleteMany();
    await prisma.utilisateur.deleteMany();

    // Create 10 users with role AUTHOR
    const authors = await Promise.all(
      new Array(10).fill(null).map(async () => {
        return prisma.utilisateur.create({
          data: {
            nom: faker.name.findName(),
            email: faker.internet.email(),
            password: faker.internet.password(),
            role: 'AUTHOR',
          },
        });
      })
    );

    // Create 1 user with role ADMIN
    const existingAdmin = await prisma.utilisateur.findUnique({ where: { email: 'zaid@elmouaddibe.ma' } });
    if (existingAdmin) {
      await prisma.utilisateur.delete({ where: { id: existingAdmin.id } });
    }
    
    const admin = await prisma.utilisateur.create({
      data: {
        nom: 'elmouaddibe',
        email: 'zaid@elmouaddibe.ma',
        password: 'enset2023',
        role: 'ADMIN',
      },
    });

    // Create 10 categories
    const categories = await Promise.all(
      new Array(10).fill(null).map(async () => {
        return prisma.categorie.create({
          data: {
            nom: faker.lorem.word(),
          },
        });
      })
    );

    // Create 100 articles
    const articles = await Promise.all(
      new Array(100).fill(null).map(async () => {
        const authorId = authors[Math.floor(Math.random() * authors.length)].id;
        const categoryIds = categories.slice(0, Math.floor(Math.random() * 4 + 1)).map((c) => c.id);
        return prisma.article.create({
          data: {
            titre: faker.lorem.sentence(),
            contenu: faker.lorem.paragraphs(),
            image: faker.image.imageUrl(),
            createdAt: faker.date.recent(),
            updatedAt: faker.date.recent(),
            published: faker.datatype.boolean(),
            utilisateur: {
              connect: { id: authorId },
            },
            categories: {
              connect: categoryIds.map((id) => ({ id })),
            },
          },
        });
      })
    );

    // Create 0-20 comments for each article
    await Promise.all(
      articles.map(async (article) => {
        const commentCount = Math.floor(Math.random() * 21);
        await Promise.all(
          new Array(commentCount).fill(null).map(async () => {
            return prisma.commentaire.create({
              data: {
                email: faker.internet.email(),
                contenu: faker.lorem.paragraph(),
                article: {
                  connect: { id: article.id },
                },
              },
            });
          })
        );
      })
    );

    console.log('Data seeded successfully.');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });