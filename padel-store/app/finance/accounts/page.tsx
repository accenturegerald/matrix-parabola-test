import Link from 'next/link'
import { prisma } from '../../lib/prisma'

export default async function AccountsPage() {
  const accounts = await prisma.chartOfAccounts.findMany({ orderBy: { code: 'asc' }, take: 200 })
  return (
    <main className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold">Chart of Accounts</h1>
        <Link href="/finance/accounts/new" className="px-3 py-2 rounded-lg bg-[--card] border border-[--border]">New Account</Link>
      </div>
      <div className="grid gap-3">
        {accounts.map(a => (
          <Link key={a.id} href={`/finance/accounts/${a.id}`} className="p-4 rounded-xl bg-[--card] border border-[--border]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{a.code} · {a.name}</p>
                <p className="text-sm text-[--muted-foreground]">{a.type}</p>
              </div>
            </div>
          </Link>
        ))}
        {accounts.length === 0 && <p className="text-[--muted-foreground]">No accounts found.</p>}
      </div>
    </main>
  )
}
