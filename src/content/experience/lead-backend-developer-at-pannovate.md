---
company:
  reference: "pannovate"
role: Lead Back-end Developer
location:
  reference: "belgrade-serbia"
startDate: 2020-01-01
endDate: 2020-12-01
type: Full-time
tags:
  - nestjs
  - typescript
  - postgresql
  - oauth2-oidc
  - docker
  - rabbitmq
  - fintech
description: "Architected 'Syllo', a highly secure and scalable fintech microservice ecosystem designed to process millions of payment transactions with sub-second latency. Enforced rigorous security standards by implementing full OAuth2 and OpenID Connect (OIDC) authentication flows for third-party integrations."
---

At Pannovate, I led the backend engineering effort for **Syllo**, a next-generation "digital bank in a box" orchestration layer. The platform serves as the middle-ware spine for several European fintechs, enabling them to launch full-featured banking apps (KYC, Cards, Wallets, IBANs) in a fraction of the traditional time.

### Syllo: The Fintech Orchestrator

Syllo acts as a smart middleware that enables financial institutions to rapidly deploy branded banking apps. The architecture was designed to be vendor-agnostic, allowing clients to swap BaaS (Banking-as-a-Service) providers without rewriting their mobile apps.

#### Ecosystem Component Architecture

| Service           | Responsibility                              | Technology         |
| :---------------- | :------------------------------------------ | :----------------- |
| **Identity Core** | OIDC/OAuth2 Auth, User Profiles             | NestJS, PostgreSQL |
| **Ledger Engine** | Double-entry bookkeeping, ACID Transactions | NestJS, PostgreSQL |
| **Vendor Hub**    | Adapters for Marqeta, Railsbank, GPS        | TypeScript, Axios  |
| **Notification**  | Real-time Push, SMS, Email                  | Node.js, RabbitMQ  |
| **Audit Log**     | Immutable trail of every API call           | Go, MongoDB        |

### PCI-DSS Compliance & Security

Handling financial data requires the highest level of security. I spearheaded the effort to make Syllo **PCI-DSS Level 1** compliant.

#### Security Implementation Matrix

| Control Area           | Security Measure                | Tooling              |
| :--------------------- | :------------------------------ | :------------------- |
| **Data Encryption**    | AES-256 for PII at rest         | AWS KMS / Vault      |
| **Transport Security** | mTLS between all microservices  | Linkerd / Istio      |
| **Identity**           | Multi-factor Auth (MFA/TOTP)    | Twilio / Google Auth |
| **Code Integrity**     | Vulnerability scanning in CI/CD | Snyk / SonarQube     |

### Deep Dive: The Transaction Life Cycle

A single payment request in Syllo triggers a complex chain of events across multiple services. Ensuring consistency was our #1 priority.

1. **Validation**: Verify user identity and session via Identity Core.
2. **Pre-Auth**: Check balance in Ledger and place a "Pending" hold.
3. **Vendor Call**: Execute the transaction via a third-party BaaS (e.g., Railsbank).
4. **Finalization**: Update the Ledger state to "Settled" or "Failed".
5. **Event Emission**: Notify the user and update the Audit Log via RabbitMQ.

#### Performance & Reliability KPIs

| Metric                    | Target  | Result | Improvement   |
| :------------------------ | :------ | :----- | :------------ |
| **Authorization Latency** | < 150ms | 68ms   | 55% reduction |
| **Settlement Speed**      | < 1.0s  | 0.45s  | 2.2x faster   |
| **Uptime (SLA)**          | 99.95%  | 99.99% | +0.04%        |
| **Transaction Success**   | 99.8%   | 99.96% | +0.16%        |

### Strategic Vendor Management

I developed a pluggable "Adapter Architecture". This allowed Syllo to expand into the APAC and LATAM markets by simply adding new vendor adapters for local banking partners without touching the core ledger logic.

- **Outcome**: Reduced onboarding time for new banking partners from **4 months to 3 weeks**.
- **Resiliency**: If a primary vendor (e.g., Marqeta) experienced downtime, the hub could automatically failover to a secondary partner for critical transaction types.

### Technical Leadership & Culture

Beyond code, I managed a team of 6 backend developers. I introduced:

- **RFC Process**: For every architectural change, preventing "design-by-accident".
- **Strict TDD**: Achieving 90% test coverage on the Ledger and Identity services.
- **Automated Documentation**: Using Swagger/OpenAPI to keep the frontend teams in sync.

### Challenges & Solutions

> **IMPORTANT**
> **Challenge**: Maintaining strict ACID compliance across distributed microservices without using heavy distributed transactions (2PC).
>
> **Solution**: Implemented the **Saga Pattern** with RabbitMQ. Each service manages its own database and emits "compensation" events if a downstream step fails, allowing for eventual consistency and reliable rollbacks in a high-throughput environment.

### Project Impact

- **3 Major Banks** launched on Syllo within one year.
- **$500M+** In transaction volume processed in the first 6 months.
- **Zero data loss** recorded across millions of ledger entries.

---

_My time at Pannovate solidified my expertise in building high-integrity financial systems that balance security with extreme scalability._
