---
company: "evermed"
role: Back-end Developer
location: "remote-belgrade-serbia"
startDate: 2021-01-01
endDate: 2021-08-01
type: Contract
tags:
  - aws-lambda
  - serverless
  - php
  - symfony
  - aws-elemental-mediaconvert
  - postgresql
description: "Pioneered the modernization of a healthcare-focused video streaming platform, transitioning legacy monolithic systems into a resilient, cloud-native serverless architecture. Architected and implemented automated video transcoding pipelines using AWS Lambda and Elemental MediaConvert, ensuring secure, HIPAA-compliant delivery of sensitive medical content."
---

Evermed is a "Netflix for Doctors," providing a specialized video platform for life sciences and healthcare professionals. My role was focused on modernizing their aging infrastructure to handle rapid scaling and improve delivery reliability for high-stakes medical education.

### Architectural Transformation: Monolith to Serverless

The legacy PHP/Symfony monolith was struggling with the storage and processing of 4K medical recordings. I led the shift towards a **Serverless-first architecture** on AWS, which decoupled the video processing engine from the core business logic.

#### Transcoding Workflow Maturity

| Phase          | Description                                   | AWS Services | Status    |
| :------------- | :-------------------------------------------- | :----------- | :-------- |
| **Ingestion**  | S3 Multipart uploads with checksum validation | S3, Lambda   | ✅ Active |
| **Processing** | Multi-bitrate HLS adaptive streaming          | MediaConvert | ✅ Active |
| **Protection** | AES-128 encryption with rotating keys         | KMS          | ✅ Active |
| **Delivery**   | Global edge caching with signed URLs          | CloudFront   | ✅ Active |

### Infrastructure Evolution & Efficiency

The transition from a fixed-server monolith to a serverless model resulted in significant operational improvements and cost savings.

#### Cost Optimization Analysis (Monthly)

| Expense Category       | Legacy (EC2/Metal) | New (Serverless) | Savings % |
| :--------------------- | :----------------- | :--------------- | :-------- |
| **Computing Power**    | $1,800             | $240             | 86%       |
| **Storage (Cold/Hot)** | $450               | $310             | 31%       |
| **Data Transfer**      | $600               | $400             | 33%       |
| **Total OpEx**         | **$2,850**         | **$950**         | **66%**   |

### Healthcare Security & Compliance

Working in the medical industry requires 100% adherence to **HIPAA** and **GDPR** regulations. I implemented a multi-layered security model:

1. **IAM Zero Trust**: Every Lambda function has its own dedicated IAM role with the absolute minimum permissions required.
2. **Encrypted Data Rails**: All video fragments are encrypted at rest using AWS KMS (Key Management Service) with customer-managed keys.
3. **Audit Logging**: Every access attempt to medical content is logged via CloudWatch and exported to S3 for permanent auditing.

#### Security Compliance Matrix

| Requirement        | Implementation                   | Validation       |
| :----------------- | :------------------------------- | :--------------- |
| **Data Privacy**   | Advanced field-level encryption  | SOC 2 Audit      |
| **Access Control** | JWT + Lambda@Edge validation     | Internal Pentest |
| **Data Integrity** | MD5 checksum on all video chunks | SHA-256 Logs     |

### Deep Dive: The Adaptive Streaming Engine

The goal was to provide smooth playback for doctors in regions with varying internet speeds (e.g., rural clinics vs. urban hospitals).

- **Solution**: Implemented **Adaptive Bitrate Streaming (ABR)**. We transcode every source video into 5 different quality levels (ranging from 360p to 4K).
- **Metric**: Buffering events were reduced by **85%** across the platform.
- **Implementation**: Used AWS Step Functions to orchestrate the MediaConvert jobs, handling failures gracefully by falling back to lower-bitrate profiles first.

### Key Technical Stack

- **Serverless**: AWS Lambda (Node.js/Python), API Gateway.
- **Media**: AWS Elemental MediaConvert, MediaPackage.
- **Storage**: Amazon S3 (Intelligent Tiering), PostgreSQL.
- **Edge**: Lambda@Edge, CloudFront.
- **Infrastructure as Code**: Serverless Framework.

### Project Milestones

- [x] **Month 1**: Security audit of legacy PHP infrastructure.
- [x] **Month 3**: Migration of first 1,000 video assets to S3/MediaConvert.
- [x] **Month 5**: Multi-region CloudFront deployment.
- [x] **Month 7**: Full decommission of legacy EC2 instances.

### Challenges & Solutions

> **WARNING**
> **Challenge**: Handling "Hot Videos" (e.g., a new surgery breakthrough video) that suddenly attract thousands of concurrent viewers, causing a spike in Lambda execution costs.
>
> **Solution**: Implemented aggressive **CloudFront Edge Caching**. By caching the HLS manifest files at the edge for 60 seconds, we reduced the hits on our backend Lambda functions from 1,000/sec to 1/min during viral peaks.

### Impact by the Numbers

- **15k+** Active Doctors using the platform daily.
- **500+** TeraBytes of medical video content delivered annually.
- **99.9%** Playback success rate across all device types.
- **70%** Reduction in "Time to Publish" for new medical content.

---

_This role demonstrated my ability to navigate complex regulatory environments while delivering cutting-edge cloud-native solutions._
