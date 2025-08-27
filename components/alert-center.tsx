"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bell,
  BellRing,
  AlertTriangle,
  Info,
  AlertCircle,
  XCircle,
  Check,
  X,
  Clock,
  Brain,
  Activity,
  Shield,
  Zap,
} from "lucide-react"
import type { Alert } from "@/lib/alert-system"

interface AlertCenterProps {
  alerts: Alert[]
  onAcknowledge: (alertId: string) => void
  onResolve: (alertId: string) => void
  onDismiss: (alertId: string) => void
}

export function AlertCenter({ alerts, onAcknowledge, onResolve, onDismiss }: AlertCenterProps) {
  const [selectedTab, setSelectedTab] = useState("all")

  const getSeverityIcon = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4 text-destructive" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-destructive" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-accent" />
      case "info":
        return <Info className="w-4 h-4 text-primary" />
    }
  }

  const getCategoryIcon = (category: Alert["category"]) => {
    switch (category) {
      case "ai":
        return <Brain className="w-4 h-4" />
      case "performance":
        return <Activity className="w-4 h-4" />
      case "security":
        return <Shield className="w-4 h-4" />
      case "traffic":
        return <Zap className="w-4 h-4" />
      default:
        return <Bell className="w-4 h-4" />
    }
  }

  const getSeverityBadge = (severity: Alert["severity"]) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "error":
        return "destructive"
      case "warning":
        return "secondary"
      case "info":
        return "outline"
    }
  }

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (minutes > 0) return `${minutes}m ago`
    return "Just now"
  }

  const filterAlerts = (alerts: Alert[], filter: string) => {
    switch (filter) {
      case "unacknowledged":
        return alerts.filter((a) => !a.acknowledged)
      case "critical":
        return alerts.filter((a) => a.severity === "critical")
      case "resolved":
        return alerts.filter((a) => a.resolved)
      default:
        return alerts
    }
  }

  const filteredAlerts = filterAlerts(alerts, selectedTab)
  const unacknowledgedCount = alerts.filter((a) => !a.acknowledged).length
  const criticalCount = alerts.filter((a) => a.severity === "critical" && !a.resolved).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BellRing className="w-5 h-5" />
          Alert Center
          {unacknowledgedCount > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unacknowledgedCount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Monitor and manage system alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({alerts.length})</TabsTrigger>
            <TabsTrigger value="unacknowledged">New ({unacknowledgedCount})</TabsTrigger>
            <TabsTrigger value="critical">Critical ({criticalCount})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="mt-4">
            <ScrollArea className="h-96">
              {filteredAlerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No alerts in this category</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border transition-colors ${
                        alert.acknowledged ? "bg-muted/30 border-muted" : "bg-card hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2 mt-0.5">
                          {getSeverityIcon(alert.severity)}
                          {getCategoryIcon(alert.category)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium truncate">{alert.title}</h4>
                            <Badge variant={getSeverityBadge(alert.severity)} className="text-xs">
                              {alert.severity.toUpperCase()}
                            </Badge>
                            {alert.source === "ai" && (
                              <Badge variant="outline" className="text-xs">
                                AI
                              </Badge>
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{alert.message}</p>

                          {alert.metadata?.recommendation && (
                            <div className="p-2 rounded bg-primary/10 border border-primary/20 mb-2">
                              <p className="text-xs text-primary font-medium mb-1">Recommendation:</p>
                              <p className="text-xs">{alert.metadata.recommendation}</p>
                            </div>
                          )}

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(alert.timestamp)}
                              {alert.acknowledged && (
                                <Badge variant="outline" className="text-xs">
                                  Acknowledged
                                </Badge>
                              )}
                              {alert.resolved && (
                                <Badge variant="outline" className="text-xs">
                                  Resolved
                                </Badge>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {!alert.acknowledged && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onAcknowledge(alert.id)}
                                  className="h-6 px-2 text-xs"
                                >
                                  <Check className="w-3 h-3 mr-1" />
                                  Ack
                                </Button>
                              )}

                              {!alert.resolved && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onResolve(alert.id)}
                                  className="h-6 px-2 text-xs"
                                >
                                  Resolve
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDismiss(alert.id)}
                                className="h-6 w-6 p-0"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
