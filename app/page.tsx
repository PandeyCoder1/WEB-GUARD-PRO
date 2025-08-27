"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Zap, Users, Server, Clock, Wifi, WifiOff, Bell, Shield } from "lucide-react"
import { useRealTimeMetrics } from "@/hooks/use-real-time-metrics"
import { useAIAnalysis } from "@/hooks/use-ai-analysis"
import { useAlertSystem } from "@/hooks/use-alert-system"
import { useSecurityMonitoring } from "@/hooks/use-security-monitoring"
import { usePerformanceMonitoring } from "@/hooks/use-performance-monitoring"
import { RealTimeChart } from "@/components/real-time-chart"
import { MetricCard } from "@/components/metric-card"
import { AIInsightsPanel } from "@/components/ai-insights-panel"
import { AlertCenter } from "@/components/alert-center"
import { SecurityPanel } from "@/components/security-panel"
import { PerformancePanel } from "@/components/performance-panel"
import { useEffect } from "react"

export default function HealthMonitoringDashboard() {
  const { metrics, isConnected, lastUpdated } = useRealTimeMetrics()
  const { anomalies, insights, isAnalyzing } = useAIAnalysis(metrics)
  const {
    alerts,
    processMetrics,
    processAnomalies,
    acknowledgeAlert,
    resolveAlert,
    dismissAlert,
    getUnacknowledgedCount,
    getCriticalCount,
  } = useAlertSystem()
  const { metrics: securityMetrics, isScanning, runSecurityScan } = useSecurityMonitoring()
  const { metrics: performanceMetrics } = usePerformanceMonitoring()

  // Process metrics and anomalies for alert generation
  useEffect(() => {
    processMetrics(metrics)
  }, [metrics, processMetrics])

  useEffect(() => {
    processAnomalies(anomalies)
  }, [anomalies, processAnomalies])

  const formatLastUpdated = () => {
    const now = new Date()
    const diff = Math.floor((now.getTime() - lastUpdated.getTime()) / 1000)

    if (diff < 60) return `${diff} seconds ago`
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`
    return lastUpdated.toLocaleTimeString()
  }

  const getChangeString = (current: number, base: number, unit = "") => {
    const change = (((current - base) / base) * 100).toFixed(1)
    const sign = Number.parseFloat(change) >= 0 ? "+" : ""
    return `${sign}${change}%${unit ? ` ${unit}` : ""}`
  }

  const unacknowledgedCount = getUnacknowledgedCount()
  const criticalCount = getCriticalCount()

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Website Health Monitor</h1>
            <p className="text-muted-foreground">Real-time insights and AI-powered anomaly detection</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge
              variant="outline"
              className={`${isConnected ? "bg-primary/10 text-primary border-primary/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}
            >
              {isConnected ? <Wifi className="w-3 h-3 mr-1" /> : <WifiOff className="w-3 h-3 mr-1" />}
              {isConnected ? "Connected" : "Reconnecting..."}
            </Badge>

            {securityMetrics && securityMetrics.threatLevel !== "low" && (
              <Badge variant="secondary" className="animate-pulse">
                <Shield className="w-3 h-3 mr-1" />
                {securityMetrics.threatLevel.toUpperCase()} Threat
              </Badge>
            )}

            {unacknowledgedCount > 0 && (
              <Badge variant="destructive" className="animate-pulse">
                <Bell className="w-3 h-3 mr-1" />
                {unacknowledgedCount} New Alert{unacknowledgedCount !== 1 ? "s" : ""}
              </Badge>
            )}

            <Button variant="outline" size="sm">
              <Clock className="w-4 h-4 mr-2" />
              Last Updated: {formatLastUpdated()}
            </Button>
          </div>
        </div>
      </div>

      {/* Critical Alert Banner */}
      {criticalCount > 0 && (
        <Card className="mb-6 border-destructive/20 bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Critical System Alert</p>
                <p className="text-xs text-muted-foreground">
                  {criticalCount} critical alert{criticalCount !== 1 ? "s" : ""} require immediate attention
                </p>
              </div>
              <Button variant="outline" size="sm">
                View Alerts
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard
          title="Active Users"
          value={metrics.activeUsers.toLocaleString()}
          change={getChangeString(metrics.activeUsers, 2847)}
          changeType={metrics.activeUsers > 2847 ? "positive" : "negative"}
          icon={Users}
          isLive={true}
        />

        <MetricCard
          title="Response Time"
          value={`${metrics.responseTime}ms`}
          change={getChangeString(metrics.responseTime, 142)}
          changeType={metrics.responseTime < 142 ? "positive" : "negative"}
          icon={Zap}
          isLive={true}
        />

        <MetricCard
          title="Error Rate"
          value={`${metrics.errorRate}%`}
          change={getChangeString(metrics.errorRate, 0.12)}
          changeType={metrics.errorRate < 0.12 ? "positive" : "negative"}
          icon={AlertTriangle}
          isLive={true}
        />

        <MetricCard
          title="Server Load"
          value={`${metrics.serverLoad}%`}
          change={getChangeString(metrics.serverLoad, 68)}
          changeType={metrics.serverLoad < 75 ? "positive" : "negative"}
          icon={Server}
          isLive={true}
        />
      </div>

      {/* Main Dashboard Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Traffic Chart */}
            <div className="lg:col-span-2">
              <RealTimeChart
                data={metrics.trafficData}
                title="Traffic Overview"
                description="Real-time visitor analytics and trends"
                color="hsl(var(--primary))"
              />
            </div>

            {/* AI Insights Panel */}
            <AIInsightsPanel anomalies={anomalies} insights={insights} isAnalyzing={isAnalyzing} />

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Core web vitals and server performance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>First Contentful Paint</span>
                    <span className="text-primary">{metrics.performanceData.fcp}s</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(20, 100 - metrics.performanceData.fcp * 30)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Largest Contentful Paint</span>
                    <span className="text-primary">{metrics.performanceData.lcp}s</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(20, 100 - metrics.performanceData.lcp * 25)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Cumulative Layout Shift</span>
                    <span className="text-primary">{metrics.performanceData.cls}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(20, 100 - metrics.performanceData.cls * 500)}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Events */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Events</CardTitle>
                <CardDescription>Latest system events and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {anomalies.slice(0, 2).map((anomaly) => (
                    <div key={anomaly.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                      <div
                        className={`w-2 h-2 rounded-full ${anomaly.severity === "critical" ? "bg-destructive" : "bg-accent"} animate-pulse`}
                      ></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">AI Alert: {anomaly.description}</p>
                        <p className="text-xs text-muted-foreground">Just detected</p>
                      </div>
                      <Badge variant={anomaly.severity === "critical" ? "destructive" : "secondary"}>
                        {anomaly.severity}
                      </Badge>
                    </div>
                  ))}

                  {securityMetrics &&
                    securityMetrics.events.slice(0, 1).map((event) => (
                      <div key={event.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                        <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Security: {event.details}</p>
                          <p className="text-xs text-muted-foreground">From {event.source}</p>
                        </div>
                        <Badge variant="secondary">Security</Badge>
                      </div>
                    ))}

                  <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Metrics updated</p>
                      <p className="text-xs text-muted-foreground">{formatLastUpdated()}</p>
                    </div>
                    <Badge variant="outline">Info</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="security">
          <SecurityPanel metrics={securityMetrics} isScanning={isScanning} onRunScan={runSecurityScan} />
        </TabsContent>

        <TabsContent value="performance">
          <PerformancePanel metrics={performanceMetrics} />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertCenter
            alerts={alerts}
            onAcknowledge={acknowledgeAlert}
            onResolve={resolveAlert}
            onDismiss={dismissAlert}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
