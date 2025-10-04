"use client"

import { useState } from 'react'

export default function SaleBuilder({ variants, customers, locations }: { variants: any[]; customers: any[]; locations: any[] }) {
  const [items, setItems] = useState<{ variantId: string; quantity: number; unitPrice?: number }[]>([])
  const [customerId, setCustomerId] = useState<string | undefined>(undefined)
  const [locationId, setLocationId] = useState<string | undefined>(locations[0]?.id)

  function addItem(variantId: string) {
    setItems((prev) => [...prev, { variantId, quantity: 1 }])
  }

  async function submit() {
    const res = await fetch('/api/sales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, locationId, items }),
    })
    if (!res.ok) {
      const data = await res.json()
      alert('Error: ' + (data.error || 'Failed'))
    } else {
      const data = await res.json()
      window.location.href = `/sales`
    }
  }

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <label className="text-sm">Customer</label>
        <select value={customerId ?? ''} onChange={(e) => setCustomerId(e.target.value || undefined)} className="p-2 rounded-lg bg-[--card] border border-[--border]">
          <option value="">Walk-in</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>{c.firstName ?? ''} {c.lastName ?? ''}</option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <label className="text-sm">Location</label>
        <select value={locationId ?? ''} onChange={(e) => setLocationId(e.target.value || undefined)} className="p-2 rounded-lg bg-[--card] border border-[--border]">
          {locations.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label className="text-sm">Add Item</label>
        <div className="grid md:grid-cols-2 gap-2">
          {variants.slice(0, 20).map((v) => (
            <button key={v.id} onClick={() => addItem(v.id)} className="p-2 rounded-lg bg-[--card] border border-[--border] text-left">
              <div className="font-semibold">{v.product.name}</div>
              <div className="text-xs text-[--muted-foreground]">{v.sku}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm">Sale Items</label>
        {items.length === 0 && <div className="text-[--muted-foreground] text-sm">No items yet.</div>}
        {items.map((it, idx) => (
          <div key={idx} className="flex gap-2 items-center">
            <input type="text" value={it.variantId} readOnly className="p-2 rounded-lg bg-[--card] border border-[--border] flex-1" />
            <input type="number" min={1} value={it.quantity} onChange={(e) => setItems(prev => prev.map((p, i) => i === idx ? { ...p, quantity: Number(e.target.value) } : p))} className="p-2 rounded-lg bg-[--card] border border-[--border] w-24" />
            <button onClick={() => setItems(prev => prev.filter((_, i) => i !== idx))} className="h-10 rounded-lg bg-red-600 text-white font-semibold px-4">Remove</button>
          </div>
        ))}
      </div>

      <div>
        <button onClick={submit} className="h-10 rounded-lg bg-[--primary] text-[--primary-foreground] font-semibold px-4">Create Sale</button>
      </div>
    </div>
  )
}
