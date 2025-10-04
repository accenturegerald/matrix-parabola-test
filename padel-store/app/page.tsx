import { prisma } from './lib/prisma'
import { getRange, getPreviousRange } from './lib/date-range'

async function getMetrics(rangeKey: 'today' | 'week' | 'month') {
  const { start, end } = getRange(rangeKey)
  const prev = getPreviousRange(rangeKey)

  const [currentSales, currentRevenue, currentCOGS, prevRevenue] = await Promise.all([
    prisma.sale.count({ where: { date: { gte: start, lte: end } } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { date: { gte: start, lte: end } } }),
    prisma.sale.aggregate({ _sum: { cogsAmount: true }, where: { date: { gte: start, lte: end } } }),
    prisma.sale.aggregate({ _sum: { totalAmount: true }, where: { date: { gte: prev.start, lte: prev.end } } }),
  ])

  const totalRevenue = Number(currentRevenue._sum.totalAmount ?? 0)
  const totalCOGS = Number(currentCOGS._sum.cogsAmount ?? 0)
  const profitability = totalRevenue - totalCOGS
  const prevRev = Number(prevRevenue._sum.totalAmount ?? 0)
  const delta = prevRev === 0 ? 100 : ((totalRevenue - prevRev) / Math.max(prevRev, 1)) * 100

  // crude inventory status: total quantity of variants
  const inventoryQty = await prisma.inventory.aggregate({ _sum: { quantity: true } })

  return {
    totalSales: currentSales,
    totalRevenue,
    profitability,
    inventoryQty: Number(inventoryQty._sum.quantity ?? 0),
    delta,
  }
}

export default async function Home() {
  const metrics = await getMetrics('week')
  return (
    <main className="min-h-screen bg-[--background] text-[--foreground]">
      <div className="p-4 pb-2 flex items-center justify-between">
        <div className="size-12 shrink-0 items-center flex">
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8"
            style={{
              backgroundImage:
                'url(https://lh3.googleusercontent.com/aida-public/AB6AXuBul9vdrWwAJJPMAVqx6FTJX3nQvGz4r2vBI1Bztmfa5Z5mpmj367cdB9GK1x1fKbdqTk1kp35FEi0gTDNLq76fBTnLieiBO3WXqcU7sTA3wMf4zcXF0AoKNaRvuwMrV9x00b1WCHK50O_143Pv5lUhJRB4yxCEhlXXyopWFDWxyAzhZHH20tyKi7x9qJX3M2yR8vk7JsORLaEvVzpYflwRef0RezoM8gI9z3pGR8eTFbiFoAmBhXX_NMZUJ9SGnWE1h5n8Igzr5L8)'
            }}
          />
        </div>
        <h2 className="text-lg font-bold tracking-tight flex-1 text-center">Admin Dashboard</h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex h-12 items-center justify-center rounded-lg text-base font-bold">
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="flex h-10 items-center justify-center rounded-lg p-1 border border-[--border] bg-[--card]">
          {['Today', 'This Week', 'This Month'].map((label, i) => (
            <label key={label} className="flex cursor-pointer h-full grow items-center justify-center rounded-lg px-2 has-[:checked]:bg-[--primary] has-[:checked]:text-[--primary-foreground] text-sm font-medium">
              <span className="truncate">{label}</span>
              <input defaultChecked={i === 1} className="invisible w-0" name="date-range" type="radio" value={label} />
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-4 p-4">
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[--card] border border-[--border]">
          <p className="text-[--muted-foreground] text-base font-medium">Total Sales</p>
          <p className="text-2xl font-bold tracking-tight">{metrics.totalSales}</p>
          <p className="text-green-500 text-base font-medium">{metrics.delta.toFixed(0)}%</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[--card] border border-[--border]">
          <p className="text-[--muted-foreground] text-base font-medium">Inventory Status</p>
          <p className="text-2xl font-bold tracking-tight">{metrics.inventoryQty} Items</p>
          <p className="text-[--muted-foreground] text-base font-medium">in stock</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[--card] border border-[--border]">
          <p className="text-[--muted-foreground] text-base font-medium">Total Revenue</p>
          <p className="text-2xl font-bold tracking-tight">${'{'}metrics.totalRevenue.toLocaleString(){'}'}</p>
          <p className="text-green-500 text-base font-medium">{metrics.delta.toFixed(0)}%</p>
        </div>
        <div className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-[--card] border border-[--border]">
          <p className="text-[--muted-foreground] text-base font-medium">Profitability</p>
          <p className="text-2xl font-bold tracking-tight">${'{'}metrics.profitability.toLocaleString(){'}'}</p>
          <p className="text-green-500 text-base font-medium">{metrics.delta.toFixed(0)}%</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 px-4 py-6">
        <div className="flex min-w-72 flex-1 flex-col gap-2 rounded-xl border border-[--border] p-6 bg-[--card]">
          <p className="text-[--muted-foreground] text-base font-medium">Sales Over Time</p>
          <p className="text-[32px] font-bold truncate">$12,500</p>
          <div className="flex gap-1">
            <p className="text-[--muted-foreground] text-base">This Week</p>
            <p className="text-green-500 text-base font-medium">+5%</p>
          </div>
          <div className="flex min-h-[180px] flex-1 flex-col gap-8 py-4">
            <svg fill="none" height="148" preserveAspectRatio="none" viewBox="-3 0 478 150" width="100%" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25V149H326.769H0V109Z" fill="url(#paint0_linear_chart)"></path>
              <path d="M0 109C18.1538 109 18.1538 21 36.3077 21C54.4615 21 54.4615 41 72.6154 41C90.7692 41 90.7692 93 108.923 93C127.077 93 127.077 33 145.231 33C163.385 33 163.385 101 181.538 101C199.692 101 199.692 61 217.846 61C236 61 236 45 254.154 45C272.308 45 272.308 121 290.462 121C308.615 121 308.615 149 326.769 149C344.923 149 344.923 1 363.077 1C381.231 1 381.231 81 399.385 81C417.538 81 417.538 129 435.692 129C453.846 129 453.846 25 472 25" stroke="#38e07b" strokeLinecap="round" strokeWidth="3"></path>
              <defs>
                <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_chart" x1="236" x2="236" y1="1" y2="149">
                  <stop stopColor="#38e07b" stopOpacity="0.3"></stop>
                  <stop offset="1" stopColor="#38e07b" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
            </svg>
            <div className="flex justify-around">
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d) => (
                <p key={d} className="text-[13px] font-bold tracking-[0.015em] text-[--muted-foreground]">{d}</p>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center px-4 py-3">
        <div className="flex flex-1 gap-3 max-w-[480px] flex-col items-stretch">
          {['Manage Inventory','View Sales Reports','Customer Insights'].map((t) => (
            <button key={t} className="flex h-12 w-full items-center justify-center rounded-lg px-5 bg-[color(display-p3_0.22_0.9_0.48_/_0.2)] text-[--primary] font-bold">
              <span className="truncate">{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="h-20" />
      <div className="fixed bottom-0 left-0 right-0 bg-[--card] border-t border-[--border]">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          {[
            { icon: 'home', label: 'Home', active: true },
            { icon: 'shopping_bag', label: 'Orders' },
            { icon: 'inventory_2', label: 'Products' },
            { icon: 'settings', label: 'Settings' },
          ].map((i) => (
            <a key={i.label} className={`flex flex-col items-center justify-center ${i.active ? 'text-[--primary]' : 'text-[--muted-foreground]'}`} href="#">
              <span className="material-symbols-outlined">{i.icon}</span>
              <span className="text-xs">{i.label}</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
