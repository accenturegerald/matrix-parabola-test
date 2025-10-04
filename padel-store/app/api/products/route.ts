import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

type VariantInput = {
  sku: string
  barcode?: string
  attributes?: Record<string, any>
}

type ProductInput = {
  sku: string
  name: string
  description?: string
  brand?: string
  costPrice: string | number
  sellingPrice: string | number
  taxRate?: string | number
  variants?: VariantInput[]
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ProductInput
    if (!body || !body.sku || !body.name) {
      return NextResponse.json({ error: 'Missing sku or name' }, { status: 400 })
    }

    const created = await prisma.product.create({
      data: {
        sku: body.sku,
        name: body.name,
        description: body.description,
        brand: body.brand,
        costPrice: body.costPrice as any,
        sellingPrice: body.sellingPrice as any,
        taxRate: (body.taxRate ?? 0) as any,
        variants: body.variants && body.variants.length > 0 ? {
          create: body.variants.map(v => ({ sku: v.sku, barcode: v.barcode, attributes: v.attributes as any }))
        } : undefined,
      },
      include: { variants: true },
    })

    return NextResponse.json({ id: created.id, variantIds: created.variants.map(v => v.id) }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Internal Server Error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q') ?? undefined
  const take = Number(searchParams.get('take') ?? 50)
  const skip = Number(searchParams.get('skip') ?? 0)

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
          { brand: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {}

  const [items, total] = await Promise.all([
    prisma.product.findMany({ where, include: { variants: true }, take, skip, orderBy: { createdAt: 'desc' } }),
    prisma.product.count({ where }),
  ])
  return NextResponse.json({ items, total })
}

