"use client"

export interface PerformanceMetrics {
  cpu: {
    usage: number
    cores: number
    temperature: number
  }
  memory: {
    used: number
    total: number
    percentage: number
  }
  disk: {
    used: number
    total: number
    percentage: number
    iops: number
  }
  network: {
    inbound: number
    outbound: number
    latency: number
    packetLoss: number
  }
  database: {
    connections: number
    queryTime: number
    slowQueries: number
    cacheHitRate: number
  }
  api: {
    requestsPerSecond: number
    averageResponseTime: number
    errorRate: number
    endpoints: ApiEndpoint[]
  }
}

export interface ApiEndpoint {
  path: string
  method: string
  responseTime: number
  requests: number
  errors: number
  status: "healthy" | "slow" | "error"
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics = {
    cpu: { usage: 45, cores: 8, temperature: 65 },
    memory: { used: 8.2, total: 16, percentage: 51 },
    disk: { used: 120, total: 500, percentage: 24, iops: 1200 },
    network: { inbound: 15.5, outbound: 8.2, latency: 12, packetLoss: 0.1 },
    database: { connections: 25, queryTime: 45, slowQueries: 2, cacheHitRate: 94.5 },
    api: {
      requestsPerSecond: 150,
      averageResponseTime: 120,
      errorRate: 0.8,
      endpoints: [],
    },
  }

  private listeners: ((metrics: PerformanceMetrics) => void)[] = []

  constructor() {
    this.initializeApiEndpoints()
    this.startMonitoring()
  }

  private initializeApiEndpoints() {
    this.metrics.api.endpoints = [
      {
        path: "/api/users",
        method: "GET",
        responseTime: 85,
        requests: 1250,
        errors: 5,
        status: "healthy",
      },
      {
        path: "/api/auth/login",
        method: "POST",
        responseTime: 145,
        requests: 890,
        errors: 12,
        status: "healthy",
      },
      {
        path: "/api/data/analytics",
        method: "GET",
        responseTime: 320,
        requests: 450,
        errors: 8,
        status: "slow",
      },
      {
        path: "/api/upload",
        method: "POST",
        responseTime: 2100,
        requests: 120,
        errors: 15,
        status: "error",
      },
    ]
  }

  private startMonitoring() {
    setInterval(() => {
      this.updateMetrics()
    }, 3000) // Update every 3 seconds
  }

  private updateMetrics() {
    // CPU metrics
    this.metrics.cpu.usage = Math.max(0, Math.min(100, this.metrics.cpu.usage + (Math.random() - 0.5) * 10))
    this.metrics.cpu.temperature = Math.max(40, Math.min(85, this.metrics.cpu.temperature + (Math.random() - 0.5) * 5))

    // Memory metrics
    const memoryChange = (Math.random() - 0.5) * 2
    this.metrics.memory.used = Math.max(4, Math.min(15, this.metrics.memory.used + memoryChange))
    this.metrics.memory.percentage = (this.metrics.memory.used / this.metrics.memory.total) * 100

    // Disk metrics
    this.metrics.disk.iops = Math.max(500, Math.min(3000, this.metrics.disk.iops + (Math.random() - 0.5) * 200))

    // Network metrics
    this.metrics.network.inbound = Math.max(0, this.metrics.network.inbound + (Math.random() - 0.5) * 5)
    this.metrics.network.outbound = Math.max(0, this.metrics.network.outbound + (Math.random() - 0.5) * 3)
    this.metrics.network.latency = Math.max(5, Math.min(100, this.metrics.network.latency + (Math.random() - 0.5) * 10))

    // Database metrics
    this.metrics.database.connections = Math.max(
      10,
      Math.min(100, this.metrics.database.connections + Math.floor((Math.random() - 0.5) * 10)),
    )
    this.metrics.database.queryTime = Math.max(
      20,
      Math.min(200, this.metrics.database.queryTime + (Math.random() - 0.5) * 20),
    )
    this.metrics.database.cacheHitRate = Math.max(
      85,
      Math.min(99, this.metrics.database.cacheHitRate + (Math.random() - 0.5) * 2),
    )

    // API metrics
    this.metrics.api.requestsPerSecond = Math.max(
      50,
      Math.min(500, this.metrics.api.requestsPerSecond + (Math.random() - 0.5) * 50),
    )
    this.metrics.api.averageResponseTime = Math.max(
      50,
      Math.min(300, this.metrics.api.averageResponseTime + (Math.random() - 0.5) * 30),
    )

    // Update API endpoints
    this.metrics.api.endpoints.forEach((endpoint) => {
      endpoint.responseTime = Math.max(50, endpoint.responseTime + (Math.random() - 0.5) * 50)
      endpoint.requests += Math.floor(Math.random() * 10)

      if (Math.random() < 0.1) {
        endpoint.errors += 1
      }

      // Update status based on response time
      if (endpoint.responseTime > 1000) {
        endpoint.status = "error"
      } else if (endpoint.responseTime > 300) {
        endpoint.status = "slow"
      } else {
        endpoint.status = "healthy"
      }
    })

    this.notifyListeners()
  }

  public subscribe(listener: (metrics: PerformanceMetrics) => void) {
    this.listeners.push(listener)
    listener(this.metrics) // Send initial data
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener({ ...this.metrics }))
  }

  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics }
  }
}
