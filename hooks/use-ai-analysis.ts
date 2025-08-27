"use client"

import { useState, useEffect, useRef } from "react"
import { AIAnomalyEngine, type AnomalyDetection, type AIInsight } from "@/lib/ai-anomaly-engine"
import type { SystemMetrics } from "@/hooks/use-real-time-metrics"

export function useAIAnalysis(metrics: SystemMetrics) {
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const engineRef = useRef<AIAnomalyEngine>()

  // Initialize AI engine
  useEffect(() => {
    engineRef.current = new AIAnomalyEngine()
  }, [])

  // Run AI analysis when metrics change
  useEffect(() => {
    if (!engineRef.current) return

    setIsAnalyzing(true)

    // Simulate AI processing time
    const analysisTimeout = setTimeout(() => {
      const analysis = engineRef.current!.analyzeMetrics(metrics)
      setAnomalies(analysis.anomalies)
      setInsights(analysis.insights)
      setIsAnalyzing(false)
    }, 500) // 500ms simulated AI processing time

    return () => clearTimeout(analysisTimeout)
  }, [metrics])

  const getAnomaliesBySeverity = (severity: AnomalyDetection["severity"]) => {
    return anomalies.filter((a) => a.severity === severity)
  }

  const getCriticalAnomalies = () => getAnomaliesBySeverity("critical")
  const getHighSeverityAnomalies = () => getAnomaliesBySeverity("high")

  const getInsightsByCategory = (category: AIInsight["category"]) => {
    return insights.filter((i) => i.category === category)
  }

  return {
    anomalies,
    insights,
    isAnalyzing,
    getCriticalAnomalies,
    getHighSeverityAnomalies,
    getAnomaliesBySeverity,
    getInsightsByCategory,
  }
}
