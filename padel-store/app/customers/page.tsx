import Link from 'next/link'
import { prisma } from '../lib/prisma'

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Customers</h1>
        <Link href="/customers/new" className="px-3 py-2 rounded-lg bg-[--card] border border-[--border]">New Customer</Link>
      </div>
      <div className="grid gap-3">
        {customers.map(c => (
          <Link key={c.id} href={`/customers/${c.id}`} className="p-4 rounded-xl bg-[--card] border border-[--border]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{c.firstName ?? ''} {c.lastName ?? ''}</p>
                <p className="text-sm text-[--muted-foreground]">{c.email ?? ''} · {c.phone ?? ''}</p>
              </div>
            </div>
          </Link>
        ))}
        {customers.length === 0 && <p className="text-[--muted-foreground]">No customers found.</p>}
      </div>
    </main>
  )
}
