import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const genres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
    'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
    'Sports', 'Supernatural', 'Thriller', 'Isekai', 'Mecha',
    'Shounen', 'Shoujo', 'Seinen', 'Josei', 'Ecchi',
  ]

  for (const name of genres) {
    await prisma.genre.upsert({
      where: { slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
      update: {},
      create: {
        name,
        slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      },
    })
  }

  console.log(`Seeded ${genres.length} genres`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
