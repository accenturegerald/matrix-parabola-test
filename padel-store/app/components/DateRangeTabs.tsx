"use client"

import { useRouter, useSearchParams } from "next/navigation"

const options = [
  { key: "today", label: "Today" },
  { key: "week", label: "This Week" },
  { key: "month", label: "This Month" },
] as const

export function DateRangeTabs() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = (searchParams.get("range") ?? "week") as "today" | "week" | "month"

  function setRange(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("range", key)
    router.push(`/?${params.toString()}`)
  }

  return (
    <div className="flex h-10 items-center justify-center rounded-lg p-1 border border-[--border] bg-[--card]">
      {options.map((opt) => (
        <label key={opt.key} className={`flex cursor-pointer h-full grow items-center justify-center rounded-lg px-2 text-sm font-medium ${current === opt.key ? 'bg-[--primary] text-[--primary-foreground]' : ''}`}>
          <span className="truncate">{opt.label}</span>
          <input
            className="invisible w-0"
            type="radio"
            name="date-range"
            value={opt.key}
            checked={current === opt.key}
            onChange={() => setRange(opt.key)}
          />
        </label>
      ))}
    </div>
  )
}
