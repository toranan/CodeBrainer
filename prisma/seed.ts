import { promises as fs } from "fs"
import path from "path"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  const filePath = path.join(process.cwd(), "prisma", "seed-data", "problems.json")
  const file = await fs.readFile(filePath, "utf-8")
  const problem = JSON.parse(file)

  const existing = await prisma.problem.findUnique({ where: { slug: problem.slug } })
  if (existing) {
    console.log(`Problem with slug ${problem.slug} already exists. Skipping seed.`)
    return
  }

  await prisma.problem.create({
    data: {
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      categories: problem.categories,
      statement: problem.statement,
      ioSample: problem.ioSample,
      constraints: problem.constraints,
      languages: problem.languages,
      hints: {
        create: problem.hints,
      },
      solutions: {
        create: problem.solutions,
      },
      testcases: {
        create: problem.testcases,
      },
    },
  })

  console.log(`Seeded problem ${problem.title}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
