// Minimal seed for Chart of Accounts and Locations (JS runtime)
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const accounts = [
    { code: '1000', name: 'Cash', type: 'ASSET', systemKey: 'CASH' },
    { code: '1100', name: 'Accounts Receivable', type: 'ASSET', systemKey: 'AR' },
    { code: '1200', name: 'Inventory Asset', type: 'ASSET', systemKey: 'INVENTORY_ASSET' },
    { code: '2000', name: 'Tax Payable', type: 'LIABILITY', systemKey: 'TAX_PAYABLE' },
    { code: '4000', name: 'Sales Revenue', type: 'REVENUE', systemKey: 'SALES_REVENUE' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'EXPENSE', systemKey: 'COGS' },
  ]

  for (const a of accounts) {
    await prisma.chartOfAccounts.upsert({ where: { systemKey: a.systemKey }, update: {}, create: a })
  }

  await prisma.location.upsert({ where: { code: 'MAIN' }, update: {}, create: { code: 'MAIN', name: 'Main Store', type: 'STORE' } })
  await prisma.location.upsert({ where: { code: 'WH' }, update: {}, create: { code: 'WH', name: 'Warehouse', type: 'WAREHOUSE' } })
  await prisma.location.upsert({ where: { code: 'ONLINE' }, update: {}, create: { code: 'ONLINE', name: 'Online', type: 'ONLINE' } })
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
