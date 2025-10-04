import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const take = Number(searchParams.get('take') ?? 50)
  const skip = Number(searchParams.get('skip') ?? 0)
  const items = await prisma.sale.findMany({
    take,
    skip,
    orderBy: { date: 'desc' },
    include: { items: { include: { variant: { include: { product: true } } } }, customer: true, location: true },
  })
  const total = await prisma.sale.count()
  return NextResponse.json({ items, total })
}

