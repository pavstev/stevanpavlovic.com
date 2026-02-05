---
title: Fleet Visualizer
subtitle: Real-time Vehicle Telemetry Platform
meta: "2023"
description: >-
  A high-performance full-stack platform for real-time visualization of vehicle
  telemetry data, processing millions of GPS coordinates and sensor readings
  daily with sub-second latency through optimized microservices architecture and
  WebSocket streaming.
image: ../../assets/telemetry.png
demoUrl: https://telemetry.com
tags:
  - frontend-dev
  - prog-langs
  - general-concepts
  - web-tech
  - apis-integrations
  - microservices
  - databases
featured: true
duration: 10 months
teamSize: 5-member full-stack team
role: Full-Stack Architect & Lead Developer
impact: >-
  Monitored 10K+ vehicles in real-time, reducing fleet incident response time by
  65%
challenges:
  - >-
    Processing and visualizing millions of telemetry data points with sub-second
    latency
  - >-
    Optimizing map rendering performance for thousands of concurrent vehicle
    markers
  - Designing time-series data storage and querying for historical playback
---

## Problem Statement

Enterprise logistics companies manage massive vehicle fleets requiring real-time
monitoring of location, speed, fuel consumption, engine diagnostics, and driver
behavior. Traditional fleet management systems suffered from significant data
lag (5-15 minutes), poor visualization performance with large datasets, and
inability to provide historical playback for incident investigation.

Fleet managers needed a modern solution that could:

- Visualize thousands of vehicles simultaneously on interactive maps in
  real-time
- Process high-frequency telemetry data (1-second intervals) without
  overwhelming infrastructure
- Provide historical playback for route analysis and incident investigation
- Alert on anomalous patterns (speeding, harsh braking, geofence violations)
- Meet strict SLA requirements for enterprise clients (99.9% uptime, <2s
  latency)

## Technical Approach & Architecture

### System Design

The Fleet Visualizer platform comprised three main architectural layers:

1. **Data Ingestion Layer**: High-throughput microservices receiving telemetry
   from vehicle IoT devices
2. **Real-Time Streaming Layer**: WebSocket servers pushing live updates to
   frontend clients
3. **Frontend Visualization Layer**: React-based SPA rendering interactive maps
   with thousands of markers

### Architecture Decisions

**Frontend**: React with TypeScript for type safety and developer experience.
Leveraged Mapbox GL JS for high-performance map rendering supporting thousands
of markers with hardware acceleration.

**Backend**: Node.js microservices for data ingestion, Python for ML-based
anomaly detection, and Go for high-performance WebSocket servers handling 10K+
concurrent connections.

**Data Storage**: TimescaleDB (PostgreSQL extension) for time-series telemetry
data, Redis for real-time caching and pub/sub, and InfluxDB for metrics and
monitoring.

## Implementation Details

### High-Frequency Data Ingestion

Vehicle IoT devices transmitted telemetry every 1-5 seconds including GPS
coordinates, speed, heading, fuel level, engine RPM, and diagnostic codes. At
scale, this generated millions of data points hourly.

**Ingestion Pipeline**:

1. **API Gateway**: Load-balanced RESTful endpoints receiving batched telemetry
   uploads
2. **Validation Layer**: Schema validation, data sanitization, and duplicate
   detection
3. **Stream Processing**: Kafka streams for real-time processing and routing
4. **Storage**: Parallel writes to TimescaleDB (long-term storage) and Redis
   (real-time access)
5. **Event Broadcasting**: Publish to Redis pub/sub for WebSocket server
   consumption

**Optimization Techniques**:

- Batch inserts to TimescaleDB (500 rows per txn) reducing database overhead by
  80%
- Aggressive Redis caching of latest vehicle positions (30-second TTL)
- Data compression for network transfer reducing bandwidth by 60%
- Asynchronous processing for non-critical operations (analytics, reporting)

### Real-Time WebSocket Streaming

Built scalable WebSocket infrastructure supporting 10K+ concurrent client
connections:

**Connection Management**:

- Implemented sticky sessions at load balancer for WebSocket persistence
- Horizontal scaling of WebSocket servers with Redis pub/sub for cross-server
  communication
- Heartbeat mechanism detecting stale connections and implementing automatic
  reconnection
- Client-side buffering and reconnection logic handling temporary network
  failures

**Data Push Strategy**:

- Clients subscribe to specific vehicles or geofences reducing unnecessary data
  transfer
- Server-side throttling ensuring max 20 updates/second per client preventing UI
  overwhelm
- Delta compression sending only changed properties reducing payload sizes by
  70%
- Priority queuing for critical alerts (SOS, accidents) ensuring immediate
  delivery

### Map Visualization & Performance

Rendering thousands of real-time vehicle markers presented significant
performance challenges:

**Rendering Optimizations**:

- **Clustering**: Dynamically clustered vehicles at low zoom levels, expanding
  to individual markers when zoomed
- **Viewport Culling**: Only rendered vehicles visible in current map viewport
- **Canvas Rendering**: Leveraged Mapbox GL's WebGL-based rendering for hardware
  acceleration
- **Marker Pooling**: Reused DOM elements for markers reducing GC pressure
- **Throttled Updates**: Limited map updates to 10 FPS even with higher data
  rates

**Interactive Features**:

- Click vehicle marker to view detailed telemetry and historical data
- Draw custom geofences triggering alerts when vehicles enter/exit
- Historical playback with speed controls for route analysis
- Heatmaps visualizing traffic patterns and high-activity zones

### Time-Series Data Management

Historical telemetry storage and querying required specialized database design:

**TimescaleDB Implementation**:

- Hypertables partitioned by time (1-week chunks) for efficient querying and
  retention management
- Continuous aggregates for pre-computed hourly/daily statistics
- Retention policies automatically purging data older than 2 years
- Strategic indexing on (vehicle_id, timestamp) for fast historical queries

**Query Optimization**:

- Generated efficient SQL for complex time-range queries
- Implemented query result caching for common dashboard views
- Used database read replicas for analytics workloads isolating from real-time
  traffic
- Aggregated data at multiple time granularities (minute, hour, day) for fast
  dashboard rendering

## Challenges & Solutions

**Challenge 1: WebSocket Scalability** A single WebSocket server couldn't handle
thousands of concurrent connections while maintaining low latency.

_Solution_: Implemented horizontal scaling with Redis pub/sub. When telemetry
arrived, ingestion service published to Redis channel. Multiple WebSocket
servers subscribed to these channels and pushed to their connected clients.
Achieved linear scalability adding more WebSocket servers as client count grew.

**Challenge 2: Map Performance with Large Datasets** Rendering 10K+ vehicle
markers simultaneously caused severe UI lag and browser crashes.

_Solution_: Implemented sophisticated clustering algorithm at multiple zoom
levels, viewport-based rendering (only showing visible vehicles), and
Canvas-based custom marker rendering. Additionally, throttled map updates to max
10 FPS. These optimizations enabled smooth 60 FPS rendering even with 10K+
active vehicles.

**Challenge 3: Data Freshness vs. System Load** Clients wanted 1-second data
freshness, but this created unsustainable database load.

_Solution_: Implemented multi-tier caching strategy. Real-time positions cached
in Redis with 30-second TTL. WebSocket servers read from Redis, not database.
Database writes batched every 5 seconds. This reduced database load by 90% while
maintaining perceived real-time updates through WebSocket streaming.

## Impact & Results

The Fleet Visualizer platform transformed fleet management for enterprise
logistics clients:

### Quantifiable Outcomes

- **10K+ Vehicles**: Simultaneously monitored in real-time with sub-second data
  latency
- **65% Reduction**: In incident response time through instant alerting
- **5M+ Data Points**: Processed daily with 99.95% reliability
- **Sub-2s Latency**: Average end-to-end latency from vehicle to dashboard
- **99.9% Uptime**: System availability exceeding enterprise SLA requirements

### Business Impact

- Reduced fuel costs by 15% through route optimization insights
- Decreased accident rates by 25% via driver behavior monitoring
- Improved customer satisfaction with accurate ETAs based on real-time location
- Enabled data-driven fleet maintenance reducing vehicle downtime by 30%

## Technologies & Tools

**Frontend**: React, TypeScript, Mapbox GL JS, WebSocket API, Zustand for state
management **Backend**: Node.js, Express, Python (ML anomalies), Go (WebSocket
servers) **Data**: TimescaleDB, PostgreSQL, Redis, InfluxDB, Kafka
**Infrastructure**: Docker, Kubernetes, AWS (EC2, ELB, ElastiCache, RDS)
**Monitoring**: Prometheus, Grafana, CloudWatch **Testing**: Jest, React Testing
Library, Playwright, k6 for load testing

## Lessons Learned

1. **Choose the Right Tool**: TimescaleDB was perfect for time-series data;
   trying to use vanilla PostgreSQL would have been painful
2. **WebSockets at Scale Require Planning**: Sticky sessions, pub/sub for
   multi-server coordination, and robust reconnection logic are essential
3. **Map Performance is Hard**: Don't underestimate rendering complexity; invest
   in clustering, viewport culling, and Canvas rendering early
4. **Cache Aggressively**: Multi-tier caching (Redis for real-time, database for
   historical) enabled scale we couldn't achieve otherwise
5. **Monitor Everything**: Comprehensive metrics on data lag, WebSocket
   connections, map rendering FPS were crucial for identifying bottlenecks

This project significantly expanded my skills in real-time data systems,
WebSocket infrastructure, and building high-performance interactive
visualizations at scale.
