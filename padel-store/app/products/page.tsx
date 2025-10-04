import Link from 'next/link'
import { prisma } from '../lib/prisma'

export default async function ProductsPage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q
  const products = await prisma.product.findMany({
    where: q ? { OR: [{ name: { contains: q, mode: 'insensitive' } }, { sku: { contains: q, mode: 'insensitive' } }] } : {},
    include: { variants: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })

  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Products</h1>
        <Link href="/products/new" className="px-3 py-2 rounded-lg bg-[--card] border border-[--border]">New Product</Link>
      </div>
      <div className="grid gap-3">
        {products.map(p => (
          <Link key={p.id} href={`/products/${p.id}`} className="p-4 rounded-xl bg-[--card] border border-[--border]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{p.name}</p>
                <p className="text-sm text-[--muted-foreground]">{p.sku} · {p.brand}</p>
              </div>
              <div className="text-sm text-[--muted-foreground]">{p.variants.length} variants</div>
            </div>
          </Link>
        ))}
        {products.length === 0 && <p className="text-[--muted-foreground]">No products found.</p>}
      </div>
    </main>
  )
}
