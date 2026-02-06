---
aws-lambda
label: AWS Lambda
category: cloud
description: AWS Lambda - Serverless compute service
---

AWS Lambda is a serverless compute service that lets you run code without provisioning or managing servers. You pay only for the compute time you consume - there is no charge when your code is not running.

## Related Concepts

- **Serverless Computing**: Running code without managing servers
- **Event-Driven Architecture**: Reacting to events and triggers
- **Cloud Functions**: Serverless functions in the cloud
- **Microservices**: Distributed system architecture
- **DevOps**: Development and operations practices

## Use Cases

- API backends: Building RESTful APIs with API Gateway
- Data processing: Real-time file processing, stream processing
- IoT backends: Processing device data and events
- Automation: Scheduled tasks, backup automation
- Chatbots: Building conversational interfaces

## Integration with AWS Services

- **API Gateway**: Creating REST APIs
- **S3**: Processing uploaded files
- **DynamoDB**: Database operations
- **SNS/SQS**: Message queue processing
- **CloudWatch**: Logging and monitoring
- **Step Functions**: Orchestrating complex workflows

## Best Practices

- Keep functions small and focused: Single responsibility principle
- Optimize cold starts: Use provisioned concurrency, keep dependencies minimal
- Implement proper error handling: Retry logic, dead letter queues
- Monitor performance: Use CloudWatch metrics and logs
- Secure functions: Use IAM roles, environment variables for secrets

## Common Patterns

- Event-driven architecture: React to changes in data or state
- Microservices: Building serverless microservices
- Batch processing: Processing large datasets in parallel
- Real-time processing: Stream processing with Kinesis
- Scheduled tasks: Cron-like functionality with CloudWatch Events

## Limitations

- Execution time: Maximum 15 minutes per invocation
- Memory: 128MB to 10GB per function
- Disk space: 512MB ephemeral storage
- Cold starts: Initial invocation latency
- State management: Stateless by design

---

_Last updated: 2026-02-06_
