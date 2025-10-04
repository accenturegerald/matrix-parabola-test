import { notFound, redirect } from 'next/navigation'
import { prisma } from '../../../lib/prisma'
import { revalidatePath } from 'next/cache'

async function updateAccount(_: any, formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const name = String(formData.get('name') || '')
  const type = String(formData.get('type') || 'ASSET') as any
  await prisma.chartOfAccounts.update({ where: { id }, data: { name, type } })
  revalidatePath('/finance/accounts')
}

async function deleteAccount(_: any, formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  await prisma.chartOfAccounts.delete({ where: { id } })
  revalidatePath('/finance/accounts')
  redirect('/finance/accounts')
}

export default async function AccountDetail({ params }: { params: { id: string } }) {
  const a = await prisma.chartOfAccounts.findUnique({ where: { id: params.id } })
  if (!a) return notFound()
  return (
    <main className="p-4 max-w-xl mx-auto grid gap-4">
      <h1 className="text-xl font-bold">Edit Account</h1>
      <form action={updateAccount} className="grid gap-3">
        <input type="hidden" name="id" value={a.id} />
        <input name="name" defaultValue={a.name} className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <select name="type" defaultValue={a.type} className="p-2 rounded-lg bg-[--card] border border-[--border]">
          {['ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'].map(t => (<option key={t} value={t}>{t}</option>))}
        </select>
        <div className="flex gap-2">
          <button className="h-10 rounded-lg bg-[--primary] text-[--primary-foreground] font-semibold px-4">Save</button>
          <form action={deleteAccount}>
            <input type="hidden" name="id" value={a.id} />
            <button className="h-10 rounded-lg bg-red-600 text-white font-semibold px-4">Delete</button>
          </form>
        </div>
      </form>
    </main>
  )
}
