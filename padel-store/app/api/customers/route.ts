import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/prisma'

type CustomerInput = {
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  notes?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CustomerInput
    const created = await prisma.customer.create({ data: body })
    return NextResponse.json({ id: created.id }, { status: 201 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? 'Internal Error' }, { status: 500 })
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
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
          { firstName: { contains: q, mode: 'insensitive' } },
          { lastName: { contains: q, mode: 'insensitive' } },
        ],
      }
    : {}
  const [items, total] = await Promise.all([
    prisma.customer.findMany({ where, take, skip, orderBy: { createdAt: 'desc' } }),
    prisma.customer.count({ where }),
  ])
  return NextResponse.json({ items, total })
}

export async function PUT(req: NextRequest) {
  const body = (await req.json()) as CustomerInput & { id: string }
  if (!body.id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { id, ...data } = body
  const updated = await prisma.customer.update({ where: { id }, data })
  return NextResponse.json(updated)
}

