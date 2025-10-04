import Link from 'next/link'
import { prisma } from '../lib/prisma'

export default async function SalesPage() {
  const sales = await prisma.sale.findMany({ orderBy: { date: 'desc' }, include: { customer: true }, take: 100 })
  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Sales</h1>
        <Link href="/" className="px-3 py-2 rounded-lg bg-[--card] border border-[--border]">New Sale (via API)</Link>
      </div>
      <div className="grid gap-3">
        {sales.map(s => (
          <div key={s.id} className="p-4 rounded-xl bg-[--card] border border-[--border]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{new Date(s.date).toLocaleString()}</p>
                <p className="text-sm text-[--muted-foreground]">{s.customer?.firstName ?? ''} {s.customer?.lastName ?? ''}</p>
              </div>
              <div className="text-sm font-semibold">${'{'}Number(s.totalAmount).toLocaleString(){'}'}</div>
            </div>
          </div>
        ))}
        {sales.length === 0 && <p className="text-[--muted-foreground]">No sales yet.</p>}
      </div>
    </main>
  )
}
