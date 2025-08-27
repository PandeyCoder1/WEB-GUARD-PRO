"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Cpu, HardDrive, Wifi, Database, Activity, Zap } from "lucide-react"
import type { PerformanceMetrics, ApiEndpoint } from "@/lib/performance-monitor"

interface PerformancePanelProps {
  metrics: PerformanceMetrics | null
}

export function PerformancePanel({ metrics }: PerformancePanelProps) {
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

  const getStatusColor = (status: ApiEndpoint["status"]) => {
    switch (status) {
      case "healthy":
        return "text-primary"
      case "slow":
        return "text-accent"
      case "error":
        return "text-destructive"
    }
  }

  const getStatusBadge = (status: ApiEndpoint["status"]) => {
    switch (status) {
      case "healthy":
        return "outline"
      case "slow":
        return "secondary"
      case "error":
        return "destructive"
    }
  }

  return (
    <div className="space-y-6">
      {/* System Resources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            System Resources
          </CardTitle>
          <CardDescription>Real-time system performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* CPU */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                <span className="text-sm font-medium">CPU Usage</span>
              </div>
              <span className="text-sm text-muted-foreground">{metrics.cpu.usage.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.cpu.usage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{metrics.cpu.cores} cores</span>
              <span>{metrics.cpu.temperature}°C</span>
            </div>
          </div>

          {/* Memory */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm font-medium">Memory Usage</span>
              </div>
              <span className="text-sm text-muted-foreground">{metrics.memory.percentage.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.memory.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{metrics.memory.used.toFixed(1)} GB used</span>
              <span>{metrics.memory.total} GB total</span>
            </div>
          </div>

          {/* Disk */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4" />
                <span className="text-sm font-medium">Disk Usage</span>
              </div>
              <span className="text-sm text-muted-foreground">{metrics.disk.percentage.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.disk.percentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{metrics.disk.used} GB used</span>
              <span>{metrics.disk.iops} IOPS</span>
            </div>
          </div>

          {/* Network */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-4 h-4" />
              <span className="text-sm font-medium">Network</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Inbound</div>
                <div className="font-medium">{metrics.network.inbound.toFixed(1)} MB/s</div>
              </div>
              <div>
                <div className="text-muted-foreground">Outbound</div>
                <div className="font-medium">{metrics.network.outbound.toFixed(1)} MB/s</div>
              </div>
              <div>
                <div className="text-muted-foreground">Latency</div>
                <div className="font-medium">{metrics.network.latency.toFixed(0)}ms</div>
              </div>
              <div>
                <div className="text-muted-foreground">Packet Loss</div>
                <div className="font-medium">{metrics.network.packetLoss.toFixed(2)}%</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Database Performance
          </CardTitle>
          <CardDescription>Database metrics and query performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.database.connections}</div>
              <div className="text-xs text-muted-foreground">Active Connections</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{metrics.database.queryTime.toFixed(0)}ms</div>
              <div className="text-xs text-muted-foreground">Avg Query Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{metrics.database.slowQueries}</div>
              <div className="text-xs text-muted-foreground">Slow Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.database.cacheHitRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Cache Hit Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            API Performance
          </CardTitle>
          <CardDescription>API endpoint monitoring and response times</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{metrics.api.requestsPerSecond}</div>
              <div className="text-xs text-muted-foreground">Requests/sec</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{metrics.api.averageResponseTime.toFixed(0)}ms</div>
              <div className="text-xs text-muted-foreground">Avg Response</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{metrics.api.errorRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground">Error Rate</div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold">API Endpoints</h4>
            {metrics.api.endpoints.map((endpoint, index) => (
              <div key={index} className="p-3 rounded-lg border bg-card">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {endpoint.method}
                    </Badge>
                    <span className="text-sm font-mono">{endpoint.path}</span>
                  </div>
                  <Badge variant={getStatusBadge(endpoint.status)} className={getStatusColor(endpoint.status)}>
                    {endpoint.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div>
                    <div>Response Time</div>
                    <div className="font-medium text-foreground">{endpoint.responseTime.toFixed(0)}ms</div>
                  </div>
                  <div>
                    <div>Requests</div>
                    <div className="font-medium text-foreground">{endpoint.requests.toLocaleString()}</div>
                  </div>
                  <div>
                    <div>Errors</div>
                    <div className="font-medium text-foreground">{endpoint.errors}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
