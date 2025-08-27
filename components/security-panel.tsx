"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, AlertTriangle, Lock, Wifi, Clock, MapPin, Activity } from "lucide-react"
import type { SecurityMetrics, SecurityEvent } from "@/lib/security-monitor"

interface SecurityPanelProps {
  metrics: SecurityMetrics | null
  isScanning: boolean
  onRunScan: () => void
}

export function SecurityPanel({ metrics, isScanning, onRunScan }: SecurityPanelProps) {
  if (!metrics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getThreatLevelColor = (level: SecurityMetrics["threatLevel"]) => {
    switch (level) {
      case "critical":
        return "text-destructive"
      case "high":
        return "text-accent"
      case "medium":
        return "text-secondary"
      default:
        return "text-primary"
    }
  }

  const getThreatLevelBadge = (level: SecurityMetrics["threatLevel"]) => {
    switch (level) {
      case "critical":
        return "destructive"
      case "high":
        return "secondary"
      case "medium":
        return "outline"
      default:
        return "outline"
    }
  }

  const getEventSeverityColor = (severity: SecurityEvent["severity"]) => {
    switch (severity) {
      case "critical":
        return "text-destructive"
      case "high":
        return "text-accent"
      case "medium":
        return "text-secondary"
      default:
        return "text-muted-foreground"
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)

    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Overview
          </CardTitle>
          <CardDescription>Real-time security monitoring and threat detection</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.blockedRequests}</div>
              <div className="text-xs text-muted-foreground">Blocked Requests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{metrics.failedLogins}</div>
              <div className="text-xs text-muted-foreground">Failed Logins</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{metrics.suspiciousActivities}</div>
              <div className="text-xs text-muted-foreground">Suspicious Activities</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{metrics.vulnerabilities}</div>
              <div className="text-xs text-muted-foreground">Vulnerabilities</div>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Threat Level:</span>
              <Badge
                variant={getThreatLevelBadge(metrics.threatLevel)}
                className={getThreatLevelColor(metrics.threatLevel)}
              >
                {metrics.threatLevel.toUpperCase()}
              </Badge>
            </div>
            <Button variant="outline" size="sm" onClick={onRunScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-2"></div>
                  Scanning...
                </>
              ) : (
                <>
                  <Shield className="w-3 h-3 mr-2" />
                  Run Security Scan
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Activity
                className={`w-4 h-4 ${metrics.firewallStatus === "active" ? "text-primary" : "text-destructive"}`}
              />
              <span className="text-sm">Firewall: {metrics.firewallStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className={`w-4 h-4 ${metrics.sslStatus === "valid" ? "text-primary" : "text-accent"}`} />
              <span className="text-sm">SSL: {metrics.sslStatus}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Last scan: {formatTimestamp(metrics.lastScan)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Recent Security Events
          </CardTitle>
          <CardDescription>Latest security incidents and threats</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-64">
            {metrics.events.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No security events detected</p>
              </div>
            ) : (
              <div className="space-y-3">
                {metrics.events.map((event) => (
                  <div key={event.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className={`w-4 h-4 mt-0.5 ${getEventSeverityColor(event.severity)}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium capitalize">{event.type.replace("_", " ")}</span>
                          <Badge variant="outline" className="text-xs">
                            {event.severity.toUpperCase()}
                          </Badge>
                          {event.blocked && (
                            <Badge variant="outline" className="text-xs text-primary">
                              BLOCKED
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{event.details}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Wifi className="w-3 h-3" />
                            {event.source}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {event.location.city}, {event.location.country}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimestamp(event.timestamp)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
