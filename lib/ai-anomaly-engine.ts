"use client"

import type { MetricData, SystemMetrics } from "@/hooks/use-real-time-metrics"

export interface AnomalyDetection {
  id: string
  type: "spike" | "drop" | "trend" | "pattern" | "prediction"
  severity: "low" | "medium" | "high" | "critical"
  metric: string
  description: string
  confidence: number
  timestamp: number
  recommendation: string
  predictedImpact?: string
}

export interface AIInsight {
  id: string
  category: "performance" | "traffic" | "security" | "prediction"
  title: string
  description: string
  confidence: number
  actionable: boolean
  recommendation?: string
}

export class AIAnomalyEngine {
  private historicalData: Map<string, MetricData[]> = new Map()
  private baselineMetrics: Map<string, number> = new Map()
  private detectedAnomalies: AnomalyDetection[] = []

  constructor() {
    // Initialize baseline metrics
    this.baselineMetrics.set("activeUsers", 2800)
    this.baselineMetrics.set("responseTime", 150)
    this.baselineMetrics.set("errorRate", 0.1)
    this.baselineMetrics.set("serverLoad", 65)
  }

  // Statistical analysis functions
  private calculateMean(values: number[]): number {
    return values.reduce((sum, val) => sum + val, 0) / values.length
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = this.calculateMean(values)
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2))
    return Math.sqrt(this.calculateMean(squaredDiffs))
  }

  private calculateTrend(values: number[]): "increasing" | "decreasing" | "stable" {
    if (values.length < 3) return "stable"

    const recentValues = values.slice(-5)
    const slope = this.calculateSlope(recentValues)

    if (slope > 0.1) return "increasing"
    if (slope < -0.1) return "decreasing"
    return "stable"
  }

  private calculateSlope(values: number[]): number {
    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((sum, val) => sum + val, 0)
    const sumXY = values.reduce((sum, val, index) => sum + val * index, 0)
    const sumX2 = values.reduce((sum, _, index) => sum + index * index, 0)

    return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
  }

  // Anomaly detection algorithms
  private detectStatisticalAnomalies(
    metric: string,
    currentValue: number,
    historicalValues: number[],
  ): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []

    if (historicalValues.length < 5) return anomalies

    const mean = this.calculateMean(historicalValues)
    const stdDev = this.calculateStandardDeviation(historicalValues)
    const zScore = Math.abs((currentValue - mean) / stdDev)

    if (zScore > 2.5) {
      const isSpike = currentValue > mean
      anomalies.push({
        id: `${metric}-${Date.now()}`,
        type: isSpike ? "spike" : "drop",
        severity: zScore > 3.5 ? "critical" : zScore > 3 ? "high" : "medium",
        metric,
        description: `${metric} ${isSpike ? "spike" : "drop"} detected: ${currentValue.toFixed(2)} (${zScore.toFixed(1)}σ from normal)`,
        confidence: Math.min(95, zScore * 20),
        timestamp: Date.now(),
        recommendation: this.generateRecommendation(metric, isSpike ? "spike" : "drop"),
        predictedImpact: this.predictImpact(metric, isSpike ? "spike" : "drop"),
      })
    }

    return anomalies
  }

  private detectTrendAnomalies(metric: string, values: number[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []
    const trend = this.calculateTrend(values)

    if (trend !== "stable") {
      const slope = this.calculateSlope(values.slice(-10))
      const severity = Math.abs(slope) > 0.5 ? "high" : Math.abs(slope) > 0.2 ? "medium" : "low"

      anomalies.push({
        id: `${metric}-trend-${Date.now()}`,
        type: "trend",
        severity,
        metric,
        description: `${metric} showing ${trend} trend (slope: ${slope.toFixed(3)})`,
        confidence: Math.min(90, Math.abs(slope) * 100),
        timestamp: Date.now(),
        recommendation: this.generateRecommendation(metric, "trend"),
        predictedImpact: this.predictTrendImpact(metric, trend, slope),
      })
    }

    return anomalies
  }

  private detectPatternAnomalies(metric: string, values: number[]): AnomalyDetection[] {
    const anomalies: AnomalyDetection[] = []

    // Detect cyclical patterns
    if (values.length >= 10) {
      const recentPattern = this.analyzePattern(values.slice(-10))
      const historicalPattern = this.analyzePattern(values.slice(-20, -10))

      if (this.patternsDeviate(recentPattern, historicalPattern)) {
        anomalies.push({
          id: `${metric}-pattern-${Date.now()}`,
          type: "pattern",
          severity: "medium",
          metric,
          description: `${metric} pattern deviation detected - behavior differs from historical norm`,
          confidence: 75,
          timestamp: Date.now(),
          recommendation: this.generateRecommendation(metric, "pattern"),
        })
      }
    }

    return anomalies
  }

  private analyzePattern(values: number[]): { variance: number; trend: string; volatility: number } {
    return {
      variance: this.calculateStandardDeviation(values),
      trend: this.calculateTrend(values),
      volatility: this.calculateMean(values.map((val, i, arr) => (i > 0 ? Math.abs(val - arr[i - 1]) : 0)).slice(1)),
    }
  }

  private patternsDeviate(recent: any, historical: any): boolean {
    const varianceChange = Math.abs(recent.variance - historical.variance) / historical.variance
    const volatilityChange = Math.abs(recent.volatility - historical.volatility) / historical.volatility

    return varianceChange > 0.3 || volatilityChange > 0.4
  }

  private generateRecommendation(metric: string, anomalyType: string): string {
    const recommendations: Record<string, Record<string, string>> = {
      activeUsers: {
        spike: "Monitor server capacity and consider auto-scaling. Check for traffic sources.",
        drop: "Investigate potential service issues or marketing campaign effectiveness.",
        trend: "Analyze user engagement patterns and optimize conversion funnels.",
      },
      responseTime: {
        spike: "Check database performance, optimize queries, and review server resources.",
        drop: "Great! Monitor to ensure performance improvements are sustained.",
        trend: "Implement performance monitoring and consider infrastructure upgrades.",
      },
      errorRate: {
        spike: "Immediate investigation required. Check logs and recent deployments.",
        drop: "Excellent! Continue monitoring error patterns for sustained improvement.",
        trend: "Review error patterns and implement preventive measures.",
      },
      serverLoad: {
        spike: "Consider load balancing and resource optimization. Monitor for capacity limits.",
        drop: "Good resource utilization. Monitor for any underlying issues.",
        trend: "Plan capacity management and consider infrastructure scaling.",
      },
    }

    return recommendations[metric]?.[anomalyType] || "Monitor closely and investigate if pattern continues."
  }

  private predictImpact(metric: string, anomalyType: string): string {
    const impacts: Record<string, Record<string, string>> = {
      activeUsers: {
        spike: "Potential server overload, increased costs, possible service degradation",
        drop: "Reduced revenue, lower engagement, potential business impact",
      },
      responseTime: {
        spike: "Poor user experience, increased bounce rate, SEO impact",
        drop: "Improved user satisfaction, better conversion rates",
      },
      errorRate: {
        spike: "User frustration, data loss risk, reputation damage",
        drop: "Improved reliability, better user trust",
      },
      serverLoad: {
        spike: "System instability, potential downtime, performance degradation",
        drop: "Improved efficiency, cost savings",
      },
    }

    return impacts[metric]?.[anomalyType] || "Monitor for business impact"
  }

  private predictTrendImpact(metric: string, trend: string, slope: number): string {
    const intensity = Math.abs(slope) > 0.5 ? "significant" : "moderate"
    return `${intensity} ${trend} trend may lead to ${trend === "increasing" ? "capacity" : "performance"} concerns if continued`
  }

  // Main analysis function
  public analyzeMetrics(metrics: SystemMetrics): { anomalies: AnomalyDetection[]; insights: AIInsight[] } {
    const currentTime = Date.now()
    const newAnomalies: AnomalyDetection[] = []

    // Update historical data
    const metricsToAnalyze = [
      { name: "activeUsers", value: metrics.activeUsers },
      { name: "responseTime", value: metrics.responseTime },
      { name: "errorRate", value: metrics.errorRate },
      { name: "serverLoad", value: metrics.serverLoad },
    ]

    metricsToAnalyze.forEach(({ name, value }) => {
      const historical = this.historicalData.get(name) || []
      historical.push({ timestamp: currentTime, value })

      // Keep only last 50 data points
      if (historical.length > 50) {
        historical.shift()
      }

      this.historicalData.set(name, historical)

      // Run anomaly detection
      const values = historical.map((d) => d.value)
      newAnomalies.push(
        ...this.detectStatisticalAnomalies(name, value, values),
        ...this.detectTrendAnomalies(name, values),
        ...this.detectPatternAnomalies(name, values),
      )
    })

    // Update anomalies list (keep only recent ones)
    this.detectedAnomalies = [
      ...this.detectedAnomalies.filter((a) => currentTime - a.timestamp < 300000), // 5 minutes
      ...newAnomalies,
    ]

    // Generate AI insights
    const insights = this.generateInsights(metrics)

    return {
      anomalies: this.detectedAnomalies,
      insights,
    }
  }

  private generateInsights(metrics: SystemMetrics): AIInsight[] {
    const insights: AIInsight[] = []

    // Performance insights
    if (metrics.responseTime < 100) {
      insights.push({
        id: "perf-excellent",
        category: "performance",
        title: "Excellent Response Time",
        description: "Your application is performing exceptionally well with sub-100ms response times.",
        confidence: 95,
        actionable: false,
      })
    }

    // Traffic insights
    if (metrics.activeUsers > 3500) {
      insights.push({
        id: "traffic-high",
        category: "traffic",
        title: "High Traffic Volume",
        description: "Experiencing above-normal traffic. Monitor server capacity and user experience.",
        confidence: 90,
        actionable: true,
        recommendation: "Consider enabling auto-scaling and monitoring user experience metrics.",
      })
    }

    // Predictive insights
    const errorTrend = this.calculateTrend(Array.from(this.historicalData.get("errorRate") || []).map((d) => d.value))

    if (errorTrend === "increasing") {
      insights.push({
        id: "error-prediction",
        category: "prediction",
        title: "Error Rate Trend Alert",
        description: "AI predicts potential error rate increase based on current patterns.",
        confidence: 78,
        actionable: true,
        recommendation: "Review recent deployments and implement additional error monitoring.",
      })
    }

    return insights
  }
}
