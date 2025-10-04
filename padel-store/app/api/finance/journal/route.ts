import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const take = Number(searchParams.get('take') ?? 50)
  const skip = Number(searchParams.get('skip') ?? 0)
  const items = await prisma.journalEntry.findMany({
    orderBy: { date: 'desc' },
    take,
    skip,
    include: {
      transactions: { include: { account: true } },
      sale: true,
      purchaseOrder: true,
    },
  })
  const total = await prisma.journalEntry.count()
  return NextResponse.json({ items, total })
}

