import { prisma } from '../lib/prisma'
import { revalidatePath } from 'next/cache'

async function adjustInventory(_: any, formData: FormData) {
  'use server'
  const variantId = String(formData.get('variantId'))
  const locationId = String(formData.get('locationId'))
  const delta = Number(formData.get('delta') || 0)
  await prisma.inventory.upsert({
    where: { variantId_locationId: { variantId, locationId } },
    update: { quantity: { increment: delta } },
    create: { variantId, locationId, quantity: Math.max(0, delta) },
  })
  revalidatePath('/inventory')
}

export default async function InventoryPage() {
  const [rows, locations] = await Promise.all([
    prisma.inventory.findMany({ include: { variant: { include: { product: true } }, location: true }, orderBy: { updatedAt: 'desc' }, take: 200 }),
    prisma.location.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <main className="p-4">
      <h1 className="text-xl font-bold mb-4">Inventory</h1>
      <div className="grid gap-3">
        {rows.map(r => (
          <div key={r.id} className="p-4 rounded-xl bg-[--card] border border-[--border]">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">{r.variant.product.name}</p>
                <p className="text-sm text-[--muted-foreground]">{r.variant.sku} · {r.location.name}</p>
              </div>
              <div className="font-semibold">{r.quantity}</div>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="text-[--muted-foreground]">No inventory rows yet.</p>}
      </div>

      <h2 className="text-lg font-semibold mt-6">Adjust Inventory</h2>
      <form action={adjustInventory} className="grid grid-cols-1 md:grid-cols-4 gap-2 max-w-3xl mt-2">
        <input name="variantId" placeholder="Variant ID" className="p-2 rounded-lg bg-[--card] border border-[--border]" required />
        <select name="locationId" className="p-2 rounded-lg bg-[--card] border border-[--border]" required>
          {locations.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
        </select>
        <input name="delta" type="number" placeholder="Delta (+/-)" className="p-2 rounded-lg bg-[--card] border border-[--border]" required />
        <button className="h-10 rounded-lg bg-[--primary] text-[--primary-foreground] font-semibold">Apply</button>
      </form>
    </main>
  )
}
