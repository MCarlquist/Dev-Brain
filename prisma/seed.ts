import { PrismaClient } from '../src/generated/prisma/client.js'

import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.link.deleteMany()
  await prisma.note.deleteMany()
  await prisma.snippet.deleteMany()
  await prisma.project.deleteMany()

  // Create example projects
  const project1 = await prisma.project.create({
    data: {
      name: 'React Project',
      description: 'A sample React project for learning',
    },
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Node.js API',
      description: 'Backend API project using Node.js and Express',
    },
  })

  // Create snippets
  await prisma.snippet.createMany({
    data: [
      {
        title: 'Hello World Component',
        description: 'Basic React component',
        language: 'javascript',
        code: `import React from 'react';

function HelloWorld() {
  return <h1>Hello, World!</h1>;
}

export default HelloWorld;`,
        projectId: project1.id,
      },
      {
        title: 'Express Server Setup',
        description: 'Basic Express server',
        language: 'javascript',
        code: `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`,
        projectId: project2.id,
      },
    ],
  })

  // Create notes
  await prisma.note.createMany({
    data: [
      {
        title: 'React Best Practices',
        content: 'Use functional components, hooks, and keep components small.',
        projectId: project1.id,
      },
      {
        title: 'API Design Notes',
        content: 'Follow RESTful conventions, use proper HTTP status codes.',
        projectId: project2.id,
      },
    ],
  })

  // Create links
  await prisma.link.createMany({
    data: [
      {
        title: 'React Documentation',
        url: 'https://reactjs.org/docs',
        description: 'Official React documentation',
        projectId: project1.id,
      },
      {
        title: 'Express.js Guide',
        url: 'https://expressjs.com/en/guide/routing.html',
        description: 'Express routing guide',
        projectId: project2.id,
      },
    ],
  })

  console.log('✅ Database seeded successfully')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
