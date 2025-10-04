import { revalidatePath } from 'next/cache'
import { prisma } from '../../lib/prisma'

async function createProduct(formData: FormData) {
  'use server'
  const sku = String(formData.get('sku') || '')
  const name = String(formData.get('name') || '')
  const brand = String(formData.get('brand') || '')
  const costPrice = Number(formData.get('costPrice') || 0)
  const sellingPrice = Number(formData.get('sellingPrice') || 0)
  const taxRate = Number(formData.get('taxRate') || 0)

  const product = await prisma.product.create({ data: { sku, name, brand, costPrice: costPrice as any, sellingPrice: sellingPrice as any, taxRate: taxRate as any } })
  await prisma.productVariant.create({ data: { productId: product.id, sku: sku + '-VAR' } })

  revalidatePath('/products')
  return { id: product.id }
}

export default function NewProductPage() {
  return (
    <main className="p-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold mb-4">New Product</h1>
      <form action={createProduct} className="grid gap-3">
        <input name="sku" placeholder="SKU" className="p-2 rounded-lg bg-[--card] border border-[--border]" required />
        <input name="name" placeholder="Name" className="p-2 rounded-lg bg-[--card] border border-[--border]" required />
        <input name="brand" placeholder="Brand" className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <input name="costPrice" placeholder="Cost Price" type="number" step="0.000001" className="p-2 rounded-lg bg-[--card] border border-[--border]" required />
        <input name="sellingPrice" placeholder="Selling Price" type="number" step="0.000001" className="p-2 rounded-lg bg-[--card] border border-[--border]" required />
        <input name="taxRate" placeholder="Tax Rate (e.g. 0.21)" type="number" step="0.000001" className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <button className="h-10 rounded-lg bg-[--primary] text-[--primary-foreground] font-semibold">Create</button>
      </form>
    </main>
  )
}
