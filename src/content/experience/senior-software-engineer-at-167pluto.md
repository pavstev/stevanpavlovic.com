---
company: 167pluto
role: Senior Software Engineer
location: remote-global
startDate: 2024-02-01T00:00:00.000Z
endDate: 2025-06-01T00:00:00.000Z
type: Full-time
tags:
  - backend-dev
  - message-queues
  - databases
  - cloud-devops
  - microservices
description: >-
  Architected and spearheaded the development of a state-of-the-art,
  high-throughput betting platform leveraging a cutting-edge Node.js and NestJS
  microservices architecture. Engineering focus on extreme scalability and
  event-driven consistency, processing millions of concurrent transactions with
  millisecond latency.
---

As a Senior Software Engineer at **167Pluto**, I was a primary architect for a
high-load betting ecosystem. The platform was designed to handle the extreme
volatility of live sports betting, where traffic can increase by 100x in a
matter of seconds (e.g., during the final minutes of a World Cup match).

### Architectural Overview: Event-Driven Scale

The transition from a legacy monolith to a **Kafka-driven microservices
architecture** was the cornerstone of our strategy. This allowed us to decouple
the high-write "Bet Placement" service from the read-heavy "Odds Display" and
"User Profile" services.

#### System Load Distribution (Regional)

| Region     | Active Connections | Events/Second | Peak Bandwidth |
| :--------- | :----------------- | :------------ | :------------- |
| **LATAM**  | 850,000            | 45,000        | 12 Gbps        |
| **Asia**   | 1,200,000          | 72,000        | 18 Gbps        |
| **Europe** | 400,000            | 25,000        | 6 Gbps         |
| **Total**  | **2,450,000**      | **142,000**   | **36 Gbps**    |

### Performance Engineering Benchmarks

I led the optimization effort that transformed the platform from a struggling
legacy system into a global leader in performance.

#### Reliability & Latency Matrix

| Metric                   | Legacy System | 167Pluto (Current) | Improvement |
| :----------------------- | :------------ | :----------------- | :---------- |
| **P99 Latency (Bet)**    | 450ms         | 42ms               | 10.7x       |
| **Max Concurrent Users** | 120k          | 2.5M               | 20.8x       |
| **Error Rate (Peak)**    | 1.8%          | < 0.005%           | 360x        |
| **Cold Startup Time**    | 12 min        | 45 sec             | 16x         |

### Deep Dive: Distributed Consistency with Kafka

One of our greatest challenges was ensuring that a user's balance was correctly
updated across all shards without using global locks that would bottleneck the
system.

- **Solution**: Implemented **Event Sourcing** using Apache Kafka. Instead of
  updating a balance field, we emit "Balance Changed" events into a partitioned
  topic.
- **Result**: We achieved **linear scalability**. Adding more consumers to the
  Kafka topic allowed us to process more transactions per second without
  increasing database contention.
- **Latency Gain**: By moving to an asynchronous event-driven model, the user
  "sees" their bet confirmed in under 50ms, while the heavy financial
  reconciliation happens in the background.

### Infrastructure & Cloud Strategy

The platform runs on a custom **AWS EKS (Kubernetes)** setup across multiple
availability zones.

1. **Spot Instances**: Saved 60% on compute costs by using AWS Spot Instances
   for non-critical worker nodes.
2. **Auto-Scaling**: Custom Prometheus-based horizontal pod auto-scaler (HPA)
   that scales based on _Kafka Lag_ rather than just CPU/Memory.
3. **Database Sharding**: PostgreSQL database partitioned by `RegionID` and
   `UserID`, ensuring that no single database node processes more than 20% of
   the total load.

#### Infrastructure Reliability Stats

| Quarter     | Incidents (S1/S2) | MTTD (Detect) | MTTR (Resolve) |
| :---------- | :---------------- | :------------ | :------------- |
| **Q1 2024** | 4                 | 240s          | 45m            |
| **Q2 2024** | 2                 | 45s           | 12m            |
| **Q3 2024** | 0                 | 12s           | 4m             |
| **Q4 2024** | **0**             | **8s**        | **2m**         |

### Key Project Milestones

- [x] **Feb 2024**: Initial Architecture RFC and Proof of Concept.
- [x] **May 2024**: Migration of the LATAM region to the new Microservices.
- [x] **Aug 2024**: Rollout of the Global Odds Aggregator (10M+ updates/min).
- [x] **Dec 2024**: Achieved 99.999% uptime during the holiday sports peak.

### Challenges & Solutions

> **DANGER** **Challenge**: "Thundering Herd" effect when an underdog scores a
> goal, and 500k+ users attempt to cash out simultaneously.
>
> **Solution**: Implemented a **Virtual Queueing System** at the API Gateway
> level. During extreme spikes, we throttle non-critical requests (like profile
> updates) while prioritizing high-value transactional requests. We also
> utilized **Redis Lua scripts** to perform atomic balance checks and decrements
> in a single network round-trip.

### Technical Stack Summary

- **Backend**: Node.js 20+, NestJS, TypeScript.
- **Data**: Kafka (Messaging), Redis (Cache/Locks), PostgreSQL (ACID).
- **DevOps**: AWS (EKS, MSK, RDS), Terraform, Helm, GitHub Actions.
- **Monitoring**: Datadog, Sentry, OpenTelemetry.

### Strategic Impact

Under my tenure, the engineering team grew from 10 to 45 engineers. I
established a **"Service Ownership"** model where teams are responsible for the
full lifecycle of their services, from design to production monitoring. This
culture shift reduced our product-to-market time by **65%**.

---

_This experience reflects my ability to architect and scale some of the most
demanding real-time systems in the industry today._
