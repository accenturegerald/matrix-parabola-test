import { NextRequest, NextResponse } from 'next/server'
import { Decimal } from '@prisma/client/runtime/library'
import { prisma } from '@/app/lib/prisma'

// Simple Zod-less validation to keep deps minimal for the API example
type SaleItemInput = {
  variantId: string
  quantity: number
  unitPrice?: string | number // optional override, else use product.sellingPrice
}

type SaleInput = {
  customerId?: string
  locationId: string
  channel?: 'STORE' | 'ONLINE'
  paymentMethod?: 'CASH' | 'CARD' | 'ONLINE' | 'ACCOUNT'
  items: SaleItemInput[]
  notes?: string
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SaleInput

    if (!body || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ error: 'Invalid sale payload' }, { status: 400 })
    }

    // Load system Chart of Accounts by systemKey
    const [cash, ar, salesRevenue, cogs, inventoryAsset] = await Promise.all([
      prisma.chartOfAccounts.findUnique({ where: { systemKey: 'CASH' } }),
      prisma.chartOfAccounts.findUnique({ where: { systemKey: 'AR' } }),
      prisma.chartOfAccounts.findUnique({ where: { systemKey: 'SALES_REVENUE' } }),
      prisma.chartOfAccounts.findUnique({ where: { systemKey: 'COGS' } }),
      prisma.chartOfAccounts.findUnique({ where: { systemKey: 'INVENTORY_ASSET' } }),
    ])

    if (!cash || !ar || !salesRevenue || !cogs || !inventoryAsset) {
      return NextResponse.json({ error: 'Chart of Accounts not initialized' }, { status: 500 })
    }

    const sale = await prisma.$transaction(async (tx) => {
      // Validate location
      const location = await tx.location.findUnique({ where: { id: body.locationId } })
      if (!location) {
        throw new Error('Invalid locationId')
      }

      // Load variants and compute totals and tax
      const variantIds = body.items.map((i) => i.variantId)
      const variants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: { product: true },
      })

      const variantById = new Map(variants.map((v) => [v.id, v]))
      if (variants.length !== variantIds.length) {
        throw new Error('One or more variantIds not found')
      }

      let netAmount = new Decimal(0)
      let taxAmount = new Decimal(0)
      let cogsAmount = new Decimal(0)

      const computedItems = body.items.map((item) => {
        const variant = variantById.get(item.variantId)!
        const product = variant.product
        const unitPrice = new Decimal(item.unitPrice ?? (product.sellingPrice as unknown as Decimal))
        const unitCost = new Decimal(product.costPrice as unknown as Decimal)
        const taxRate = new Decimal(product.taxRate as unknown as Decimal)

        const lineNet = unitPrice.mul(item.quantity)
        const lineTax = lineNet.mul(taxRate)
        const lineCOGS = unitCost.mul(item.quantity)

        netAmount = netAmount.add(lineNet)
        taxAmount = taxAmount.add(lineTax)
        cogsAmount = cogsAmount.add(lineCOGS)

        return {
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtSale: unitPrice,
          costAtSale: unitCost,
          taxRateAtSale: taxRate,
          taxAmountAtSale: lineTax,
        }
      })

      const totalAmount = netAmount.add(taxAmount)

      // Create sale header
      const createdSale = await tx.sale.create({
        data: {
          customerId: body.customerId,
          locationId: body.locationId,
          channel: body.channel ?? 'STORE',
          paymentMethod: body.paymentMethod ?? 'CASH',
          netAmount: netAmount,
          taxAmount: taxAmount,
          totalAmount: totalAmount,
          cogsAmount: cogsAmount,
          notes: body.notes,
        },
      })

      // Create sale items and decrement inventory atomically
      for (const ci of computedItems) {
        await tx.saleItem.create({
          data: {
            saleId: createdSale.id,
            variantId: ci.variantId,
            quantity: ci.quantity,
            priceAtSale: ci.priceAtSale,
            costAtSale: ci.costAtSale,
            taxRateAtSale: ci.taxRateAtSale,
            taxAmountAtSale: ci.taxAmountAtSale,
          },
        })

        // decrement correct inventory row for the sale's location
        const updated = await tx.inventory.updateMany({
          where: { variantId: ci.variantId, locationId: body.locationId, quantity: { gte: ci.quantity } },
          data: { quantity: { decrement: ci.quantity } },
        })
        if (updated.count === 0) {
          throw new Error('Insufficient inventory for variant at location')
        }
      }

      // Journal entry for the sale (revenue recognition)
      const receiptAccountId = (body.paymentMethod ?? 'CASH') === 'ACCOUNT' ? ar.id : cash.id

      // If you want tax to go to a Tax Payable liability, add a ChartOfAccounts with systemKey TAX_PAYABLE
      const taxPayable = await tx.chartOfAccounts.findUnique({ where: { systemKey: 'TAX_PAYABLE' } })
      const saleTransactions: Array<{ accountId: string; amount: Decimal; direction: 'DEBIT' | 'CREDIT' }> = [
        { accountId: receiptAccountId, amount: totalAmount, direction: 'DEBIT' },
      ]
      if (taxPayable && taxAmount.gt(0)) {
        saleTransactions.push(
          { accountId: salesRevenue.id, amount: netAmount, direction: 'CREDIT' },
          { accountId: taxPayable.id, amount: taxAmount, direction: 'CREDIT' },
        )
      } else {
        // Credit revenue with total amount if no Tax Payable account configured to keep JE balanced
        saleTransactions.push({ accountId: salesRevenue.id, amount: totalAmount, direction: 'CREDIT' })
      }

      await tx.journalEntry.create({
        data: {
          saleId: createdSale.id,
          memo: 'Sale - revenue recognition',
          transactions: { create: saleTransactions as any },
        },
      })

      // Journal entry for COGS
      await tx.journalEntry.create({
        data: {
          saleId: createdSale.id,
          memo: 'Sale - COGS recognition',
          transactions: {
            create: [
              { accountId: cogs.id, amount: cogsAmount, direction: 'DEBIT' },
              { accountId: inventoryAsset.id, amount: cogsAmount, direction: 'CREDIT' },
            ],
          },
        },
      })

      return createdSale
    })

    return NextResponse.json({ id: sale.id }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message ?? 'Internal Server Error' }, { status: 500 })
  }
}

