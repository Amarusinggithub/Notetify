"use client"

import { useEffect, useRef, useState } from "react"
import { useInView, animate } from "framer-motion"

const stats = [
  { end: 1200, suffix: "+", label: "Farmers" },
  { end: 350, suffix: "+", label: "Businesses" },
  { end: 5000, suffix: "+", label: "Orders Delivered" },
  { end: 2.5, suffix: "M+", label: "Lbs of Produce" },
]

function CountUp({
  end,
  suffix,
}: {
  end: number
  suffix: string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "-100px" })

  useEffect(() => {
    if (!inView || !ref.current) return

    const controls = animate(0, end, {
      duration: 2,
      ease: "easeOut",
      onUpdate(value) {
        if (!ref.current) return
        const formatted =
          end % 1 !== 0
            ? value.toFixed(1)
            : Math.floor(value).toLocaleString()
        ref.current.textContent = formatted + suffix
      },
    })

    return () => controls.stop()
  }, [inView, end, suffix])

  return (
    <span ref={ref} className="text-4xl font-bold text-primary-foreground">
      0{suffix}
    </span>
  )
}

export function Stats() {
  return (
    <section className="bg-primary py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="mb-10 text-center text-lg font-medium text-primary-foreground/80">
          Join thousands building a stronger food system in Jamaica
        </p>
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <CountUp end={stat.end} suffix={stat.suffix} />
              <p className="mt-1 text-sm text-primary-foreground/60">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
