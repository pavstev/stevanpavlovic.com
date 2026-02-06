---
title: "Humanity Mobile Backend"
subtitle: "High-Performance BFF & Caching Layer"
meta: "2021"
description: "Architected and optimized the Backend-for-Frontend (BFF) infrastructure for Humanity.com, facilitating seamless data orchestration and ultra-fast API responses for hundreds of thousands of daily mobile users."
image: "../../assets/placeholder.png"
demoUrl: "https://humanity.com"
tags:
  - nodejs
  - go
  - redis
  - bff
  - microservices
  - performance
  - api-orchestration
featured: true
duration: "14 months"
teamSize: "Backend team of 5"
role: "Senior Backend Developer"
impact: "Reduced mobile app load times by 40% and improved database efficiency by 50%"
challenges:
  - "Aggregating data from 10+ legacy microservices into a unified API"
  - "Managing complex cache invalidation for real-time shift scheduling"
  - "Optimizing Go-based services for high-concurrency throughput"
---

## Problem Statement

Humanity.com's mobile applications were suffering from high latency due to multiple round-trips to various backend microservices. The frontend code was doing too much data transformation, leading to battery drain and a sluggish user experience.

The goal was to build a dedicated Backend-for-Frontend (BFF) layer that would:

- Aggregate multiple API calls into single, optimized payloads.
- Implement aggressive, intelligent caching.
- Shift heavy data processing from the client to the server.
- Standardize authentication and error handling across all mobile platforms.

## Technical Approach & Architecture

### System Design

I implemented a high-performance middleware layer sitting between the mobile clients and the core services. This layer was built using a combination of Node.js for rapid API development and Go for computationally intensive tasks like complex scheduling calculations.

### Key Innovations

**Intelligent Cache Invalidation**: Developed a custom Redis-based tagging system. When a manager changed a shift, only the affected employees' caches were invalidated, ensuring data was always fresh without constant database polling.

**Payload Minification**: Implemented dynamic field filtering, allowing mobile clients to request only the exact data they needed, reducing network payload sizes by up to 60%.

**Resilient Orchestration**: Used circuit breakers and retry logic to gracefully handle failures in any of the downstream legacy services, preventing a single service failure from bringing down the entire mobile app.

## Implementation Details

### Go-based Scheduling Engine

To handle complex workforce constraints (labor laws, employee availability, skill requirements), I developed a specialized Go microservice. By leveraging Go's concurrency model (goroutines), we were able to run thousands of scheduling simulations in parallel, returning optimal rosters in under 200ms.

### Automated Documentation & Testing

Introduced a "contract-first" development approach using OpenAPI (Swagger). This allowed frontend and backend teams to work in parallel and enabled automated integration testing that caught breaks before they reached production.

## Impact & Results

- **Efficiency**: Reduced average backend response time from 1.2s to 350ms.
- **Scalability**: Successfully handled traffic peaks during national holidays where user activity doubled.
- **Maintenance**: Reduced the volume of bug reports related to data inconsistency by 70%.
- **Cost**: Optimized infrastructure resource usage, leading to a 20% reduction in monthly AWS costs.
