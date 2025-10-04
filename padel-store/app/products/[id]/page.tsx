import { notFound, redirect } from 'next/navigation'
import { prisma } from '../../lib/prisma'
import { revalidatePath } from 'next/cache'

async function updateProduct(_: any, formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  const name = String(formData.get('name') || '')
  const brand = String(formData.get('brand') || '')
  const sellingPrice = Number(formData.get('sellingPrice') || 0)
  const taxRate = Number(formData.get('taxRate') || 0)

  await prisma.product.update({ where: { id }, data: { name, brand, sellingPrice: sellingPrice as any, taxRate: taxRate as any } })
  revalidatePath('/products')
}

async function deleteProduct(_: any, formData: FormData) {
  'use server'
  const id = String(formData.get('id'))
  await prisma.product.delete({ where: { id } })
  revalidatePath('/products')
  redirect('/products')
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const product = await prisma.product.findUnique({ where: { id: params.id } })
  if (!product) return notFound()
  return (
    <main className="p-4 max-w-xl mx-auto grid gap-4">
      <h1 className="text-xl font-bold">Edit Product</h1>
      <form action={updateProduct} className="grid gap-3">
        <input type="hidden" name="id" value={product.id} />
        <input name="name" defaultValue={product.name} className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <input name="brand" defaultValue={product.brand ?? ''} className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <input name="sellingPrice" type="number" step="0.000001" defaultValue={String(product.sellingPrice)} className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <input name="taxRate" type="number" step="0.000001" defaultValue={String(product.taxRate)} className="p-2 rounded-lg bg-[--card] border border-[--border]" />
        <div className="flex gap-2">
          <button className="h-10 rounded-lg bg-[--primary] text-[--primary-foreground] font-semibold px-4">Save</button>
          <form action={deleteProduct}>
            <input type="hidden" name="id" value={product.id} />
            <button className="h-10 rounded-lg bg-red-600 text-white font-semibold px-4">Delete</button>
          </form>
        </div>
      </form>
    </main>
  )
}
