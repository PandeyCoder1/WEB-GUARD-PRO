"use client"

import { useState, useEffect, useRef } from "react"
import { SecurityMonitor, type SecurityMetrics } from "@/lib/security-monitor"

export function useSecurityMonitoring() {
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const monitorRef = useRef<SecurityMonitor>()

  useEffect(() => {
    monitorRef.current = new SecurityMonitor()

    const unsubscribe = monitorRef.current.subscribe(setMetrics)

    return unsubscribe
  }, [])

  const runSecurityScan = async () => {
    if (!monitorRef.current) return null

    setIsScanning(true)
    try {
      const result = await monitorRef.current.runSecurityScan()
      return result
    } finally {
      setIsScanning(false)
    }
  }

  return {
    metrics,
    isScanning,
    runSecurityScan,
  }
}
