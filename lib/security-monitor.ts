"use client"

export interface SecurityEvent {
  id: string
  type:
    | "failed_login"
    | "suspicious_activity"
    | "ddos_attempt"
    | "malware_detected"
    | "unauthorized_access"
    | "data_breach"
  severity: "low" | "medium" | "high" | "critical"
  source: string
  target?: string
  timestamp: number
  details: string
  blocked: boolean
  location?: {
    country: string
    city: string
    ip: string
  }
}

export interface SecurityMetrics {
  threatLevel: "low" | "medium" | "high" | "critical"
  blockedRequests: number
  failedLogins: number
  suspiciousActivities: number
  vulnerabilities: number
  lastScan: number
  firewallStatus: "active" | "inactive" | "updating"
  sslStatus: "valid" | "expiring" | "expired"
  events: SecurityEvent[]
}

export class SecurityMonitor {
  private metrics: SecurityMetrics = {
    threatLevel: "low",
    blockedRequests: 0,
    failedLogins: 0,
    suspiciousActivities: 0,
    vulnerabilities: 2,
    lastScan: Date.now() - 3600000, // 1 hour ago
    firewallStatus: "active",
    sslStatus: "valid",
    events: [],
  }

  private listeners: ((metrics: SecurityMetrics) => void)[] = []

  constructor() {
    this.initializeSecurityEvents()
    this.startMonitoring()
  }

  private initializeSecurityEvents() {
    // Generate some sample security events
    const sampleEvents: Omit<SecurityEvent, "id" | "timestamp">[] = [
      {
        type: "failed_login",
        severity: "medium",
        source: "192.168.1.100",
        details: "Multiple failed login attempts detected",
        blocked: true,
        location: { country: "US", city: "New York", ip: "192.168.1.100" },
      },
      {
        type: "suspicious_activity",
        severity: "high",
        source: "10.0.0.50",
        details: "Unusual API access pattern detected",
        blocked: false,
        location: { country: "Unknown", city: "Unknown", ip: "10.0.0.50" },
      },
      {
        type: "ddos_attempt",
        severity: "critical",
        source: "Multiple IPs",
        details: "DDoS attack attempt blocked by firewall",
        blocked: true,
      },
    ]

    this.metrics.events = sampleEvents.map((event, index) => ({
      ...event,
      id: `sec-${Date.now()}-${index}`,
      timestamp: Date.now() - Math.random() * 3600000, // Random time in last hour
    }))
  }

  private startMonitoring() {
    setInterval(() => {
      this.updateMetrics()
    }, 5000) // Update every 5 seconds
  }

  private updateMetrics() {
    // Simulate security metric changes
    const variations = {
      blockedRequests: Math.floor(Math.random() * 10),
      failedLogins: Math.floor(Math.random() * 5),
      suspiciousActivities: Math.floor(Math.random() * 3),
    }

    this.metrics.blockedRequests += variations.blockedRequests
    this.metrics.failedLogins += variations.failedLogins
    this.metrics.suspiciousActivities += variations.suspiciousActivities

    // Update threat level based on activity
    const totalThreats = this.metrics.failedLogins + this.metrics.suspiciousActivities
    if (totalThreats > 50) {
      this.metrics.threatLevel = "critical"
    } else if (totalThreats > 30) {
      this.metrics.threatLevel = "high"
    } else if (totalThreats > 15) {
      this.metrics.threatLevel = "medium"
    } else {
      this.metrics.threatLevel = "low"
    }

    // Occasionally add new security events
    if (Math.random() < 0.1) {
      this.addRandomSecurityEvent()
    }

    this.notifyListeners()
  }

  private addRandomSecurityEvent() {
    const eventTypes: SecurityEvent["type"][] = ["failed_login", "suspicious_activity", "unauthorized_access"]

    const severities: SecurityEvent["severity"][] = ["low", "medium", "high"]

    const newEvent: SecurityEvent = {
      id: `sec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: eventTypes[Math.floor(Math.random() * eventTypes.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      source: `192.168.1.${Math.floor(Math.random() * 255)}`,
      details: "Real-time security event detected",
      blocked: Math.random() > 0.3,
      timestamp: Date.now(),
      location: {
        country: "US",
        city: "Unknown",
        ip: `192.168.1.${Math.floor(Math.random() * 255)}`,
      },
    }

    this.metrics.events.unshift(newEvent)

    // Keep only last 20 events
    if (this.metrics.events.length > 20) {
      this.metrics.events = this.metrics.events.slice(0, 20)
    }
  }

  public subscribe(listener: (metrics: SecurityMetrics) => void) {
    this.listeners.push(listener)
    listener(this.metrics) // Send initial data
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.metrics }))
  }

  public getMetrics(): SecurityMetrics {
    return { ...this.metrics }
  }

  public runSecurityScan(): Promise<{ vulnerabilities: number; threats: string[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const vulnerabilities = Math.floor(Math.random() * 5)
        const threats = [
          "Outdated SSL certificate detected",
          "Weak password policy",
          "Unpatched security vulnerability",
        ].slice(0, vulnerabilities)

        this.metrics.vulnerabilities = vulnerabilities
        this.metrics.lastScan = Date.now()
        this.notifyListeners()

        resolve({ vulnerabilities, threats })
      }, 2000)
    })
  }
}
