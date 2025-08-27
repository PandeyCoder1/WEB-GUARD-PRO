"use client"

import { useState, useEffect, useRef } from "react"
import { PerformanceMonitor, type PerformanceMetrics } from "@/lib/performance-monitor"

export function usePerformanceMonitoring() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const monitorRef = useRef<PerformanceMonitor>()

  useEffect(() => {
    monitorRef.current = new PerformanceMonitor()

    const unsubscribe = monitorRef.current.subscribe(setMetrics)

    return unsubscribe
  }, [])

  return {
    metrics,
  }
}
