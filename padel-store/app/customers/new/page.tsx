import { revalidatePath } from 'next/cache'
import { prisma } from '../../lib/prisma'

async function createCustomer(formData: FormData) {
  'use server'
  const email = String(formData.get('email') || '')
  const phone = String(formData.get('phone') || '')
  const firstName = String(formData.get('firstName') || '')
  const lastName = String(formData.get('lastName') || '')
  const notes = String(formData.get('notes') || '')
  await prisma.customer.create({ data: { email, phone, firstName, lastName, notes } })
  revalidatePath('/customers')
}

export default function NewCustomerPage() {
  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">New Customer</h1>
      <form action={createCustomer} className="grid gap-3">
        <input name="email" placeholder="Email" className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <input name="phone" placeholder="Phone" className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <input name="firstName" placeholder="First name" className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <input name="lastName" placeholder="Last name" className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <textarea name="notes" placeholder="Notes" className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <button className="h-10 rounded-lg bg-[--primary] text-[--primary-foreground] font-semibold">Create</button>
      </form>
    </main>
  )
}
