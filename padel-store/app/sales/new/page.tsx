import { prisma } from '../../lib/prisma'
import SaleBuilder from './SaleBuilder'

export default async function NewSalePage() {
  const [variants, customers, locations] = await Promise.all([
    prisma.productVariant.findMany({ include: { product: true }, where: { active: true }, take: 500, orderBy: { createdAt: 'desc' } }),
    prisma.customer.findMany({ orderBy: { createdAt: 'desc' }, take: 200 }),
    prisma.location.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
  ])

  return (
    <main className="p-4 max-w-3xl mx-auto grid gap-4">
      <h1 className="text-xl font-bold">New Sale</h1>
      <SaleBuilder variants={variants} customers={customers} locations={locations} />
    </main>
  )
}
