---
company:
  reference: "apoddo"
role: Back-end Developer
location:
  reference: "remote-belgrade-serbia"
startDate: 2021-01-01
endDate: 2022-03-01
type: Contract
tags:
  - nodejs
  - go
  - redis
  - rest-apis
  - graphql
  - microservices
description: "Engineered critical high-performance Backend-for-Frontend (BFF) infrastructure for Humanity.com, a leading workforce management platform. Specialized in optimizing API orchestration and data aggregation layers to handle peak traffic loads exceeding 100k requests per minute. Implemented sophisticated Redis multi-level caching strategies that reduced database load by 45% and improved mobile application responsiveness by 30%."
---

During my tenure at Apoddo, I was primarily embedded within the **Humanity.com** engineering team, focusing on the scalability and reliability of their mobile ecosystem. Humanity.com serves millions of users worldwide, making performance not just a feature, but a core requirement for a platform that handles scheduling for thousands of businesses.

### Strategic Impact at Humanity.com

The primary challenge was the fragmentation of data across numerous backend microservices. The mobile app was suffering from "over-fetching" and "multiple round-trip" issues which lead to high battery consumption and poor user experience on slow networks. I led the development of a high-performance **BFF (Backend-for-Frontend)** layer.

#### Protocol Optimization Strategy

| Protocol       | Use Case                    | Result                                                         |
| :------------- | :-------------------------- | :------------------------------------------------------------- |
| **gRPC**       | Internal Service-to-Service | Reduced payload size by 40% using Protocol Buffers.            |
| **GraphQL**    | Mobile-to-BFF               | Enabled field-level selection, saving 65% in egress bandwidth. |
| **WebSockets** | Real-time Shift Updates     | Reduced server polling by 90%, improving battery life.         |

### Platform Scale & Performance

Humanity.com operates at a massive scale. Below is a breakdown of the traffic and system health during a typical high-load period (e.g., Monday Morning Shift Starts).

#### Traffic Distribution (Peak)

| Region            | Requests/Min | Active Users | Error Rate |
| :---------------- | :----------- | :----------- | :--------- |
| **North America** | 65,000       | 450,000      | < 0.05%    |
| **Europe**        | 25,000       | 180,000      | < 0.02%    |
| **Asia Pacific**  | 12,000       | 95,000       | < 0.03%    |
| **Global Total**  | **102,000**  | **725,000**  | **0.033%** |

### Architecture Deep Dive: The Caching Pyramid

To handle 100k+ RPM without overwhelming our Aurora PostgreSQL clusters, I implemented a multi-tier caching strategy dubbed "The Pyramid".

1. **L1 Cache (In-Memory)**: 500MB LRU cache local to each Node.js instance. Response time: **< 1ms**.
2. **L2 Cache (Distributed Redis)**: Global cluster across 3 nodes. Response time: **5-10ms**.
3. **L3 Cache (Write-Through)**: Specialized Redis layer for read-heavy financial reports. Response time: **15-20ms**.

#### Performance Improvement Matrix

| Metric                   | Legacy Monolith | New BFF + Pyramid | Improvement   |
| :----------------------- | :-------------- | :---------------- | :------------ |
| **P50 Latency**          | 280ms           | 45ms              | 6.2x faster   |
| **P99 Latency**          | 1,450ms         | 190ms             | 7.6x faster   |
| **Max Concurrent Users** | 150k            | 800k+             | 5.3x capacity |
| **DB CPU Utilization**   | 92%             | 38%               | 2.4x headroom |

### Implementation Details: The Go Migration

We identified that the payroll calculation engine was a major bottleneck in our Node.js services due to intensive mathematical operations blocking the event loop.

- **Outcome**: By migrating the core logic to **Go**, we moved from a synchronous bottleneck to a highly concurrent processing model.
- **Latency Gain**: The average payroll generation time dropped from **12 seconds** to **1.8 seconds**.
- **Memory Efficiency**: Go services consumed 1/4 of the memory compared to equivalent Node.js instances under the same load.

### Technical Stack Ecosystem

- **BFF/Gateway**: Node.js 16+, Express, Apollo GraphQL.
- **Microservices**: Go (Calculations), Node.js (Business Logic).
- **Communication**: gRPC for internal, RabbitMQ for async event processing.
- **Storage**: Amazon Aurora PostgreSQL, ElastiCache (Redis).
- **Observability**: Prometheus, Grafana, Jaeger (distributed tracing).

### Key Project Milestones

- [x] **Q1 2021**: Initial BFF Architecture Drafted and Approved.
- [x] **Q2 2021**: GraphQL Gateway rollout for Beta Mobile Users.
- [x] **Q3 2021**: L1/L2 Caching "Pyramid" deployment.
- [x] **Q4 2021**: Migration of Payroll Engine to Go.
- [x] **Q1 2022**: Full decommission of legacy mobile endpoints.

### Challenges & Solutions

> **DANGER**
> **Challenge**: Cache Stampedes during global scheduled shift changes when 200k+ users login simultaneously.
>
> **Solution**: Implemented **Singleflight** logic (request collapsing) in the BFF. If 1,000 requests for the same schedule come in at once, only 1 request goes to the database while the other 999 wait for the result. This prevented database meltdowns during peak hours.

### Growth Stats

Since the implementation of the new architecture, the platform has seen:

- **30% Increase** in mobile app ratings due to perceived speed.
- **45% Reduction** in customer support tickets related to "Data Sync Errors".
- **Zero S1 Incidents** during the 2021 holiday season peak.

---

_Note: This experience highlights my ability to design and maintain high-availability systems that serve a massive global user base while optimizing for both performance and developer productivity._
