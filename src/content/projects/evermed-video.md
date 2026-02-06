---
title: "Evermed Video Infrastructure"
subtitle: "Serverless Video Transcoding & Distribution"
meta: "2021"
desc: "Designed and implemented a cloud-native, serverless video processing pipeline for a global healthcare education platform, ensuring secure, high-definition content delivery with 100% HIPAA compliance."
image: "../../assets/placeholder.png"
demoUrl: "https://evermed.com"
tags:
  - aws-lambda
  - s3
  - mediaconvert
  - serverless
  - nodejs
  - healthcare
  - video-streaming
featured: true
duration: "8 months"
teamSize: "Backend dev + DevOps lead"
role: "Lead Project Engineer"
impact: "Successfully migrated 10,000+ hours of medical content to a modern playback engine"
challenges:
  - "Orchestrating complex serverless workflows for multi-resolution transcoding"
  - "Enforcing strict HIPAA data security protocols throughout the pipeline"
  - "Minifying cost while maintaining high video quality and fast delivery"
---

## Problem Statement

Evermed's legacy video system was manual, slow, and expensive to maintain. New content took hours to go live, and the platform struggled with inconsistent playback quality across different devices and internet speeds. In the medical field, content must be delivered reliably and securely.

The mission was to:

- Fully automate the video ingestion and transcoding workflow.
- Implement Adaptive Bitrate Streaming (HLS) for a smooth viewing experience.
- Ensure end-to-end encryption and strict access controls.
- Scale infrastructure costs linearly with usage.

## Technical Approach & Architecture

### System Design

I architected a completely event-driven, serverless pipeline on AWS:

1. **Ingestion**: Videos uploaded to S3 trigger an AWS Lambda function.
2. **Preprocessing**: Lambda validates metadata and prepares the file for transcoding.
3. **Transcoding**: AWS Elemental MediaConvert handles the heavy lifting, creating HLS manifests and multiple resolution fragments.
4. **Distribution**: CloudFront serves the content globally with signed URL security.
5. **Notification**: Webhooks update the main database when content is ready for the platform.

### Security Highlights

**Compliance by Design**: Implemented field-level encryption for all medical metadata. Used AWS Key Management Service (KMS) for rotation of encryption keys. Access to raw video files was restricted to VPC-internal resources only.

**Secure Delivery**: Leveraged CloudFront Signed Cookies and URLs to ensure that only authorized healthcare professionals could view the premium educational content.

## Implementation Details

### Cost Optimization

By utilizing AWS Lambda and S3 Intelligent-Tiering, we eliminated the need for idle EC2 instances. The system only costs money when content is being processed or viewed, resulting in a 65% reduction in monthly infrastructure spend compared to the legacy monolithic setup.

### Resilient Error Handling

Built a robust retry mechanism with exponential backoff for external service calls. Failed transcodes were automatically moved to a "dead-letter" bucket and triggered an alert to the engineering team for manual inspection.

## Impact & Results

- **Speed**: Content "Time-to-Live" reduced from 4 hours to under 15 minutes.
- **Quality**: Zero playback buffering complaints reported by users over 5,000 active streams.
- **Scale**: Seamlessly handled a 400% spike in traffic during the 2021 Medical Innovation Summit.
- **Reliability**: Achieved 100% processing success rate for over 5,000 new video uploads.

## Technologies & Tools

**Cloud**: AWS (Lambda, S3, MediaConvert, CloudFront, DynamoDB, SNS)
**Language**: Node.js, Python (for data processing scripts)
**Infrastructure**: AWS CDK for Infrastructure as Code
**Monitoring**: AWS CloudWatch & X-Ray for distributed tracing
