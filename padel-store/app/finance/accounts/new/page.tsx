import { revalidatePath } from 'next/cache'
import { prisma } from '../../../lib/prisma'

async function createAccount(formData: FormData) {
  'use server'
  const code = String(formData.get('code') || '')
  const name = String(formData.get('name') || '')
  const type = String(formData.get('type') || 'ASSET') as any
  await prisma.chartOfAccounts.create({ data: { code, name, type } })
  revalidatePath('/finance/accounts')
}

export default function NewAccountPage() {
  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">New Account</h1>
      <form action={createAccount} className="grid gap-3">
        <input name="code" placeholder="Code" className="p-2 rounded-lg bg-[--card] border border-[--border]" required />
        <input name="name" placeholder="Name" className="p-2 rounded-lg bg-[--card] border border-[--border]" required />
        <select name="type" className="p-2 rounded-lg bg-[--card] border border-[--border]">
          {['ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'].map(t => (<option key={t} value={t}>{t}</option>))}
        </select>
        <button className="h-10 rounded-lg bg-[--primary] text-[--primary-foreground] font-semibold">Create</button>
      </form>
    </main>
  )
}
