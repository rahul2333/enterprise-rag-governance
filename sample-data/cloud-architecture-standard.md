# Cloud Architecture Standard

Document classification: Internal  
Source department: Cloud Platform  
Access group: engineering  
Version: 1.0

## Network Controls

Production services must use private networking where practical. Public endpoints require documented business justification and security review.

## Identity

Workload identity should use managed identity or short-lived credentials. Long-lived static cloud keys are prohibited for production workloads.

## Logging

Cloud workloads must emit structured logs with trace IDs. Logs should not contain secrets, personal data, or full document contents.

## Resilience

Business-critical services should define recovery objectives, backup schedules, and health checks. Deployments should support rollback.

## Infrastructure As Code

Cloud resources should be managed through reviewed infrastructure-as-code templates.
