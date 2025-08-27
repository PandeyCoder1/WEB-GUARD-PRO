"use client"

import { useState, useEffect, useCallback } from "react"

export interface MetricData {
  timestamp: number
  value: number
}

export interface SystemMetrics {
  activeUsers: number
  responseTime: number
  errorRate: number
  serverLoad: number
  trafficData: MetricData[]
  performanceData: {
    fcp: number
    lcp: number
    cls: number
  }
}

export function useRealTimeMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 2847,
    responseTime: 142,
    errorRate: 0.12,
    serverLoad: 68,
    trafficData: [],
    performanceData: {
      fcp: 1.2,
      lcp: 2.1,
      cls: 0.05,
    },
  })

  const [isConnected, setIsConnected] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Generate realistic metric variations
  const generateMetricVariation = useCallback((baseValue: number, variance: number) => {
    const variation = (Math.random() - 0.5) * variance
    return Math.max(0, baseValue + variation)
  }, [])

  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const now = Date.now()

        // Generate new traffic data point
        const newTrafficPoint: MetricData = {
          timestamp: now,
          value: generateMetricVariation(2800, 400),
        }

        // Keep only last 20 data points for charts
        const updatedTrafficData = [...prev.trafficData, newTrafficPoint].slice(-20)

        return {
          activeUsers: Math.round(generateMetricVariation(prev.activeUsers, 200)),
          responseTime: Math.round(generateMetricVariation(prev.responseTime, 30)),
          errorRate: Math.max(0, Number(generateMetricVariation(prev.errorRate, 0.05).toFixed(2))),
          serverLoad: Math.round(generateMetricVariation(prev.serverLoad, 15)),
          trafficData: updatedTrafficData,
          performanceData: {
            fcp: Number(generateMetricVariation(prev.performanceData.fcp, 0.3).toFixed(1)),
            lcp: Number(generateMetricVariation(prev.performanceData.lcp, 0.5).toFixed(1)),
            cls: Number(generateMetricVariation(prev.performanceData.cls, 0.02).toFixed(2)),
          },
        }
      })

      setLastUpdated(new Date())
    }, 2000) // Update every 2 seconds

    // Simulate occasional connection issues
    const connectionInterval = setInterval(() => {
      setIsConnected((prev) => (Math.random() > 0.1 ? true : prev)) // 90% uptime
    }, 5000)

    return () => {
      clearInterval(interval)
      clearInterval(connectionInterval)
    }
  }, [generateMetricVariation])

  return {
    metrics,
    isConnected,
    lastUpdated,
  }
}
