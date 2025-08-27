"use client"

import type { AnomalyDetection } from "@/lib/ai-anomaly-engine"

export interface Alert {
  id: string
  title: string
  message: string
  severity: "info" | "warning" | "error" | "critical"
  category: "performance" | "traffic" | "security" | "system" | "ai"
  timestamp: number
  acknowledged: boolean
  resolved: boolean
  source: "manual" | "threshold" | "ai" | "system"
  metadata?: Record<string, any>
  actions?: AlertAction[]
}

export interface AlertAction {
  id: string
  label: string
  type: "acknowledge" | "resolve" | "investigate" | "escalate"
  handler: () => void
}

export interface AlertRule {
  id: string
  name: string
  metric: string
  condition: "greater_than" | "less_than" | "equals" | "not_equals"
  threshold: number
  severity: Alert["severity"]
  enabled: boolean
  cooldown: number // minutes
  lastTriggered?: number
}

export interface NotificationSettings {
  enabled: boolean
  sound: boolean
  desktop: boolean
  email: boolean
  slack: boolean
  threshold: Alert["severity"]
}

export class AlertManager {
  private alerts: Alert[] = []
  private rules: AlertRule[] = []
  private settings: NotificationSettings = {
    enabled: true,
    sound: true,
    desktop: true,
    email: false,
    slack: false,
    threshold: "warning",
  }
  private listeners: ((alerts: Alert[]) => void)[] = []

  constructor() {
    this.initializeDefaultRules()
  }

  private initializeDefaultRules() {
    this.rules = [
      {
        id: "high-response-time",
        name: "High Response Time",
        metric: "responseTime",
        condition: "greater_than",
        threshold: 200,
        severity: "warning",
        enabled: true,
        cooldown: 5,
      },
      {
        id: "critical-response-time",
        name: "Critical Response Time",
        metric: "responseTime",
        condition: "greater_than",
        threshold: 500,
        severity: "critical",
        enabled: true,
        cooldown: 2,
      },
      {
        id: "high-error-rate",
        name: "High Error Rate",
        metric: "errorRate",
        condition: "greater_than",
        threshold: 0.2,
        severity: "error",
        enabled: true,
        cooldown: 3,
      },
      {
        id: "server-overload",
        name: "Server Overload",
        metric: "serverLoad",
        condition: "greater_than",
        threshold: 85,
        severity: "warning",
        enabled: true,
        cooldown: 5,
      },
      {
        id: "traffic-spike",
        name: "Traffic Spike",
        metric: "activeUsers",
        condition: "greater_than",
        threshold: 4000,
        severity: "info",
        enabled: true,
        cooldown: 10,
      },
    ]
  }

  public subscribe(listener: (alerts: Alert[]) => void) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach((listener) => listener([...this.alerts]))
  }

  public createAlert(alert: Omit<Alert, "id" | "timestamp" | "acknowledged" | "resolved">): Alert {
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      acknowledged: false,
      resolved: false,
    }

    this.alerts.unshift(newAlert)

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(0, 100)
    }

    this.triggerNotification(newAlert)
    this.notify()

    return newAlert
  }

  public acknowledgeAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.acknowledged = true
      this.notify()
    }
  }

  public resolveAlert(alertId: string) {
    const alert = this.alerts.find((a) => a.id === alertId)
    if (alert) {
      alert.resolved = true
      alert.acknowledged = true
      this.notify()
    }
  }

  public dismissAlert(alertId: string) {
    this.alerts = this.alerts.filter((a) => a.id !== alertId)
    this.notify()
  }

  public checkThresholds(metrics: Record<string, number>) {
    const now = Date.now()

    this.rules.forEach((rule) => {
      if (!rule.enabled) return

      // Check cooldown
      if (rule.lastTriggered && now - rule.lastTriggered < rule.cooldown * 60 * 1000) {
        return
      }

      const metricValue = metrics[rule.metric]
      if (metricValue === undefined) return

      let shouldTrigger = false

      switch (rule.condition) {
        case "greater_than":
          shouldTrigger = metricValue > rule.threshold
          break
        case "less_than":
          shouldTrigger = metricValue < rule.threshold
          break
        case "equals":
          shouldTrigger = metricValue === rule.threshold
          break
        case "not_equals":
          shouldTrigger = metricValue !== rule.threshold
          break
      }

      if (shouldTrigger) {
        rule.lastTriggered = now

        this.createAlert({
          title: rule.name,
          message: `${rule.metric} is ${metricValue} (threshold: ${rule.threshold})`,
          severity: rule.severity,
          category: this.getCategoryFromMetric(rule.metric),
          source: "threshold",
          metadata: {
            rule: rule.id,
            metric: rule.metric,
            value: metricValue,
            threshold: rule.threshold,
          },
        })
      }
    })
  }

  public processAnomalies(anomalies: AnomalyDetection[]) {
    anomalies.forEach((anomaly) => {
      // Check if we already have an alert for this anomaly
      const existingAlert = this.alerts.find((a) => a.source === "ai" && a.metadata?.anomalyId === anomaly.id)

      if (!existingAlert) {
        this.createAlert({
          title: `AI Alert: ${anomaly.type.charAt(0).toUpperCase() + anomaly.type.slice(1)} Detected`,
          message: anomaly.description,
          severity: this.mapAnomalySeverity(anomaly.severity),
          category: "ai",
          source: "ai",
          metadata: {
            anomalyId: anomaly.id,
            confidence: anomaly.confidence,
            recommendation: anomaly.recommendation,
          },
          actions: [
            {
              id: "investigate",
              label: "Investigate",
              type: "investigate",
              handler: () => console.log("Investigating anomaly:", anomaly.id),
            },
          ],
        })
      }
    })
  }

  private getCategoryFromMetric(metric: string): Alert["category"] {
    switch (metric) {
      case "responseTime":
      case "serverLoad":
        return "performance"
      case "activeUsers":
        return "traffic"
      case "errorRate":
        return "system"
      default:
        return "system"
    }
  }

  private mapAnomalySeverity(severity: AnomalyDetection["severity"]): Alert["severity"] {
    switch (severity) {
      case "critical":
        return "critical"
      case "high":
        return "error"
      case "medium":
        return "warning"
      case "low":
        return "info"
      default:
        return "info"
    }
  }

  private triggerNotification(alert: Alert) {
    if (!this.settings.enabled) return

    const severityLevels = { info: 0, warning: 1, error: 2, critical: 3 }
    const thresholdLevel = severityLevels[this.settings.threshold]
    const alertLevel = severityLevels[alert.severity]

    if (alertLevel < thresholdLevel) return

    // Browser notification
    if (this.settings.desktop && "Notification" in window) {
      if (Notification.permission === "granted") {
        new Notification(alert.title, {
          body: alert.message,
          icon: "/favicon.ico",
          tag: alert.id,
        })
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            new Notification(alert.title, {
              body: alert.message,
              icon: "/favicon.ico",
              tag: alert.id,
            })
          }
        })
      }
    }

    // Sound notification
    if (this.settings.sound) {
      this.playNotificationSound(alert.severity)
    }
  }

  private playNotificationSound(severity: Alert["severity"]) {
    // Create audio context for notification sounds
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Different frequencies for different severities
      const frequencies = {
        info: 440,
        warning: 554,
        error: 659,
        critical: 880,
      }

      oscillator.frequency.setValueAtTime(frequencies[severity], audioContext.currentTime)
      oscillator.type = "sine"

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.warn("Could not play notification sound:", error)
    }
  }

  public getAlerts(): Alert[] {
    return [...this.alerts]
  }

  public getUnacknowledgedAlerts(): Alert[] {
    return this.alerts.filter((a) => !a.acknowledged)
  }

  public getActiveAlerts(): Alert[] {
    return this.alerts.filter((a) => !a.resolved)
  }

  public getAlertsByCategory(category: Alert["category"]): Alert[] {
    return this.alerts.filter((a) => a.category === category)
  }

  public getAlertsBySeverity(severity: Alert["severity"]): Alert[] {
    return this.alerts.filter((a) => a.severity === severity)
  }

  public updateSettings(settings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...settings }
  }

  public getSettings(): NotificationSettings {
    return { ...this.settings }
  }

  public getRules(): AlertRule[] {
    return [...this.rules]
  }

  public updateRule(ruleId: string, updates: Partial<AlertRule>) {
    const rule = this.rules.find((r) => r.id === ruleId)
    if (rule) {
      Object.assign(rule, updates)
    }
  }
}
