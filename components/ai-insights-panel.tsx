"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, AlertTriangle, TrendingUp, Shield, Zap, Lightbulb, ChevronRight } from "lucide-react"
import type { AnomalyDetection, AIInsight } from "@/lib/ai-anomaly-engine"

interface AIInsightsPanelProps {
  anomalies: AnomalyDetection[]
  insights: AIInsight[]
  isAnalyzing: boolean
}

export function AIInsightsPanel({ anomalies, insights, isAnalyzing }: AIInsightsPanelProps) {
  const getSeverityColor = (severity: AnomalyDetection["severity"]) => {
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

  const getSeverityBadge = (severity: AnomalyDetection["severity"]) => {
    switch (severity) {
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

  const getCategoryIcon = (category: AIInsight["category"]) => {
    switch (category) {
      case "performance":
        return TrendingUp
      case "traffic":
        return Zap
      case "security":
        return Shield
      case "prediction":
        return Brain
      default:
        return Lightbulb
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          AI Analysis Engine
          {isAnalyzing && (
            <div className="flex items-center gap-2 ml-auto">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <span className="text-xs text-muted-foreground">Analyzing...</span>
            </div>
          )}
        </CardTitle>
        <CardDescription>Advanced pattern recognition and anomaly detection</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Anomalies Section */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Detected Anomalies ({anomalies.length})
          </h4>

          {anomalies.length === 0 ? (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-center">
              <p className="text-sm text-muted-foreground">No anomalies detected - all systems operating normally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {anomalies.slice(0, 3).map((anomaly) => (
                <div key={anomaly.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityBadge(anomaly.severity)} className="text-xs">
                        {anomaly.severity.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{anomaly.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-muted-foreground">Confidence:</span>
                      <Progress value={anomaly.confidence} className="w-12 h-1" />
                      <span className="text-xs font-mono">{anomaly.confidence}%</span>
                    </div>
                  </div>

                  <p className="text-sm font-medium mb-1">{anomaly.description}</p>

                  {anomaly.recommendation && (
                    <div className="mt-2 p-2 rounded bg-muted/50">
                      <p className="text-xs text-muted-foreground mb-1">AI Recommendation:</p>
                      <p className="text-xs">{anomaly.recommendation}</p>
                    </div>
                  )}

                  {anomaly.predictedImpact && (
                    <div className="mt-2 p-2 rounded bg-accent/10 border border-accent/20">
                      <p className="text-xs text-accent font-medium mb-1">Predicted Impact:</p>
                      <p className="text-xs text-muted-foreground">{anomaly.predictedImpact}</p>
                    </div>
                  )}
                </div>
              ))}

              {anomalies.length > 3 && (
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  View All {anomalies.length} Anomalies
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              )}
            </div>
          )}
        </div>

        {/* AI Insights Section */}
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            AI Insights ({insights.length})
          </h4>

          <div className="space-y-3">
            {insights.slice(0, 3).map((insight) => {
              const IconComponent = getCategoryIcon(insight.category)
              return (
                <div key={insight.id} className="p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <IconComponent className="w-4 h-4 text-primary mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{insight.title}</p>
                        <div className="flex items-center gap-1">
                          <Progress value={insight.confidence} className="w-12 h-1" />
                          <span className="text-xs font-mono text-muted-foreground">{insight.confidence}%</span>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>

                      {insight.recommendation && (
                        <div className="p-2 rounded bg-primary/10 border border-primary/20">
                          <p className="text-xs text-primary font-medium mb-1">Recommendation:</p>
                          <p className="text-xs">{insight.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {insights.length > 3 && (
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                View All {insights.length} Insights
                <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
