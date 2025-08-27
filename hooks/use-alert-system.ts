"use client"

import { useState, useEffect, useRef } from "react"
import { AlertManager, type Alert } from "@/lib/alert-system"
import type { SystemMetrics } from "@/hooks/use-real-time-metrics"
import type { AnomalyDetection } from "@/lib/ai-anomaly-engine"

export function useAlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const alertManagerRef = useRef<AlertManager>()

  useEffect(() => {
    alertManagerRef.current = new AlertManager()

    const unsubscribe = alertManagerRef.current.subscribe(setAlerts)

    return unsubscribe
  }, [])

  const processMetrics = (metrics: SystemMetrics) => {
    if (!alertManagerRef.current) return

    alertManagerRef.current.checkThresholds({
      activeUsers: metrics.activeUsers,
      responseTime: metrics.responseTime,
      errorRate: metrics.errorRate,
      serverLoad: metrics.serverLoad,
    })
  }

  const processAnomalies = (anomalies: AnomalyDetection[]) => {
    if (!alertManagerRef.current) return

    alertManagerRef.current.processAnomalies(anomalies)
  }

  const acknowledgeAlert = (alertId: string) => {
    alertManagerRef.current?.acknowledgeAlert(alertId)
  }

  const resolveAlert = (alertId: string) => {
    alertManagerRef.current?.resolveAlert(alertId)
  }

  const dismissAlert = (alertId: string) => {
    alertManagerRef.current?.dismissAlert(alertId)
  }

  const createManualAlert = (alert: Omit<Alert, "id" | "timestamp" | "acknowledged" | "resolved">) => {
    return alertManagerRef.current?.createAlert(alert)
  }

  const getUnacknowledgedCount = () => {
    return alerts.filter((a) => !a.acknowledged).length
  }

  const getCriticalCount = () => {
    return alerts.filter((a) => a.severity === "critical" && !a.resolved).length
  }

  const getActiveAlerts = () => {
    return alerts.filter((a) => !a.resolved)
  }

  return {
    alerts,
    processMetrics,
    processAnomalies,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    createManualAlert,
    getUnacknowledgedCount,
    getCriticalCount,
    getActiveAlerts,
  }
}
