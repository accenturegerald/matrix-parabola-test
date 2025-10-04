import { notFound, redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

async function updateCustomer(_: any, formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const email = String(formData.get('email') || '')
  const phone = String(formData.get('phone') || '')
  const firstName = String(formData.get('firstName') || '')
  const lastName = String(formData.get('lastName') || '')
  const notes = String(formData.get('notes') || '')
  await prisma.customer.update({ where: { id }, data: { email, phone, firstName, lastName, notes } })
  revalidatePath('/customers')
}

async function deleteCustomer(_: any, formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  await prisma.customer.delete({ where: { id } })
  revalidatePath('/customers')
  redirect('/customers')
}

export default async function CustomerDetail({ params }: { params: { id: string } }) {
  const c = await prisma.customer.findUnique({ where: { id: params.id } })
  if (!c) return notFound()
  return (
    <main className="p-4 max-w-xl mx-auto grid gap-4">
      <h1 className="text-xl font-bold">Edit Customer</h1>
      <form action={updateCustomer} className="grid gap-3">
        <input type="hidden" name="id" value={c.id} />
        <input name="email" defaultValue={c.email ?? ''} className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <input name="phone" defaultValue={c.phone ?? ''} className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <input name="firstName" defaultValue={c.firstName ?? ''} className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <input name="lastName" defaultValue={c.lastName ?? ''} className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <textarea name="notes" defaultValue={c.notes ?? ''} className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <div className="flex gap-2">
          <button className="h-10 rounded-lg bg-[--primary] text-[--primary-foreground] font-semibold px-4">Save</button>
          <form action={deleteCustomer}>
            <input type="hidden" name="id" value={c.id} />
            <button className="h-10 rounded-lg bg-red-600 text-white font-semibold px-4">Delete</button>
          </form>
        </div>
      </form>
    </main>
  )
}
