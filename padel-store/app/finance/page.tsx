import { prisma } from '../lib/prisma'

export default async function FinancePage() {
  const entries = await prisma.journalEntry.findMany({
    orderBy: { date: 'desc' },
    include: { transactions: { include: { account: true } }, sale: true },
    take: 100,
  })
  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Journal Entries</h1>
      <div className="grid gap-3">
        {entries.map(j => (
          <div key={j.id} className="p-4 rounded-xl bg-[--card] border border-[--border]">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold">{new Date(j.date).toLocaleString()}</div>
              <div className="text-sm text-[--muted-foreground]">{j.memo ?? ''}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-sm font-semibold mb-1">Debits</div>
                {j.transactions.filter(t => t.direction === 'DEBIT').map(t => (
                  <div key={t.id} className="flex justify-between text-sm">
                    <span>{t.account.name}</span>
                    <span>${'{'}Number(t.amount).toLocaleString(){'}'}</span>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-sm font-semibold mb-1">Credits</div>
                {j.transactions.filter(t => t.direction === 'CREDIT').map(t => (
                  <div key={t.id} className="flex justify-between text-sm">
                    <span>{t.account.name}</span>
                    <span>${'{'}Number(t.amount).toLocaleString(){'}'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
        {entries.length === 0 && <p className="text-[--muted-foreground]">No journal entries yet.</p>}
      </div>
    </main>
  )
}
