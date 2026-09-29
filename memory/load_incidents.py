[
  {
    "incident_id": "INC-1001",
    "resolved_at": "2026-03-20",
    "service": "server-y-gateway",
    "affected_project": "project-x",
    "severity": "high",
    "symptoms": [
      "Project X cannot connect to Server Y",
      "TLS handshake failure",
      "certificate verify failed"
    ],
    "error_signature": "SSL: CERTIFICATE_VERIFY_FAILED",
    "root_cause": "TLS certificate expired on Server Y gateway",
    "verified_fix": [
      "Renew the TLS certificate",
      "Deploy the renewed certificate",
      "Restart the gateway service",
      "Verify Project X connectivity"
    ],
    "resolved_by": "Asha Rao",
    "team": "Infrastructure",
    "resolution_status": "verified",
    "lesson": "Add certificate-expiry alerts 30 days before expiration."
  },
  {
    "incident_id": "INC-1002",
    "resolved_at": "2026-08-28",
    "service": "server-y-gateway",
    "affected_project": "project-x",
    "severity": "high",
    "symptoms": [
      "Project X API requests fail",
      "Secure connection cannot be established",
      "certificate verify failed"
    ],
    "error_signature": "x509: certificate has expired or is not yet valid",
    "root_cause": "TLS certificate expired because the certificate-renewal job failed",
    "verified_fix": [
      "Renew the TLS certificate",
      "Repair the certificate-renewal job",
      "Restart Server Y gateway",
      "Test Project X connectivity"
    ],
    "resolved_by": "Arjun Mehta",
    "team": "Infrastructure",
    "resolution_status": "verified",
    "lesson": "Monitor certificate-renewal jobs and alert Infrastructure before expiry."
  },
  {
    "incident_id": "INC-1003",
    "resolved_at": "2026-09-10",
    "service": "server-y-gateway",
    "affected_project": "project-x",
    "severity": "medium",
    "symptoms": [
      "HTTPS requests fail after certificate deployment",
      "Browser reports incomplete certificate chain"
    ],
    "error_signature": "SSL certificate verify failed: unable to get local issuer certificate",
    "root_cause": "Intermediate certificate was missing from the Server Y certificate chain",
    "verified_fix": [
      "Download the correct intermediate certificate",
      "Deploy the complete certificate chain",
      "Restart the gateway",
      "Run TLS validation"
    ],
    "resolved_by": "Arjun Mehta",
    "team": "Infrastructure",
    "resolution_status": "verified",
    "lesson": "Validate the full certificate chain before production deployment."
  },
  {
    "incident_id": "INC-1004",
    "resolved_at": "2026-04-11",
    "service": "payment-api",
    "affected_project": "checkout-service",
    "severity": "critical",
    "symptoms": [
      "Payment API returns 502",
      "Checkout requests timeout",
      "Redis connection pool exhausted"
    ],
    "error_signature": "redis.exceptions.ConnectionError: Too many connections",
    "root_cause": "Redis connection-pool limit was too low after traffic increased",
    "verified_fix": [
      "Increase Redis connection-pool limit",
      "Restart payment worker pods",
      "Monitor Redis active connections"
    ],
    "resolved_by": "Vikram Singh",
    "team": "Payments",
    "resolution_status": "verified",
    "lesson": "Alert when Redis active connections exceed 80 percent."
  },
  {
    "incident_id": "INC-1005",
    "resolved_at": "2026-08-16",
    "service": "payment-api",
    "affected_project": "checkout-service",
    "severity": "critical",
    "symptoms": [
      "Payment requests fail during peak traffic",
      "Checkout times out",
      "Redis reports too many connections"
    ],
    "error_signature": "ConnectionError: max number of clients reached",
    "root_cause": "Payment worker autoscaling increased Redis client connections beyond the configured limit",
    "verified_fix": [
      "Increase Redis max clients",
      "Set connection pooling in payment workers",
      "Restart overloaded workers",
      "Monitor connection usage"
    ],
    "resolved_by": "Priya Shah",
    "team": "Payments",
    "resolution_status": "verified",
    "lesson": "Capacity-test Redis whenever payment-worker autoscaling rules change."
  },
  {
    "incident_id": "INC-1006",
    "resolved_at": "2026-09-18",
    "service": "payment-api",
    "affected_project": "checkout-service",
    "severity": "high",
    "symptoms": [
      "Checkout is slow",
      "Payment API latency is high",
      "Redis connection wait time increased"
    ],
    "error_signature": "Redis connection pool timeout",
    "root_cause": "Redis pool exhaustion caused worker requests to wait for free connections",
    "verified_fix": [
      "Increase payment Redis pool size",
      "Reduce unnecessary Redis connections",
      "Restart payment workers",
      "Check checkout latency"
    ],
    "resolved_by": "Priya Shah",
    "team": "Payments",
    "resolution_status": "verified",
    "lesson": "Track Redis pool wait time in the Payments dashboard."
  },
  {
    "incident_id": "INC-1007",
    "resolved_at": "2026-05-07",
    "service": "auth-service",
    "affected_project": "customer-login",
    "severity": "high",
    "symptoms": [
      "Customers cannot log in",
      "Authentication API returns 401",
      "Newly generated tokens are rejected"
    ],
    "error_signature": "JWT signature verification failed",
    "root_cause": "JWT signing key mismatch between Auth Service instances",
    "verified_fix": [
      "Synchronize the JWT signing key",
      "Restart Auth Service instances",
      "Test login using a new token"
    ],
    "resolved_by": "Meera Nair",
    "team": "Authentication",
    "resolution_status": "verified",
    "lesson": "Use one centralized secret source for all Auth Service instances."
  },
  {
    "incident_id": "INC-1008",
    "resolved_at": "2026-09-02",
    "service": "auth-service",
    "affected_project": "customer-login",
    "severity": "high",
    "symptoms": [
      "Users are logged out after deployment",
      "New login attempts fail",
      "Token validation returns invalid signature"
    ],
    "error_signature": "invalid JWT signature after key rotation",
    "root_cause": "Old JWT signing key remained in one deployment environment after rotation",
    "verified_fix": [
      "Update the signing key in all environments",
      "Redeploy Auth Service",
      "Invalidate affected sessions",
      "Verify login and token refresh"
    ],
    "resolved_by": "Rahul Verma",
    "team": "Authentication",
    "resolution_status": "verified",
    "lesson": "Add a deployment check that validates key version consistency."
  },
  {
    "incident_id": "INC-1009",
    "resolved_at": "2026-06-12",
    "service": "postgres-db",
    "affected_project": "reporting-service",
    "severity": "medium",
    "symptoms": [
      "Reports load slowly",
      "Database CPU is high",
      "Dashboard requests time out"
    ],
    "error_signature": "slow query exceeded 30 seconds",
    "root_cause": "A reporting query was missing an index on the created_at column",
    "verified_fix": [
      "Create index on created_at",
      "Analyze query plan",
      "Deploy query optimization",
      "Monitor reporting latency"
    ],
    "resolved_by": "Neha Iyer",
    "team": "Data Platform",
    "resolution_status": "verified",
    "lesson": "Review query plans before releasing reporting features."
  },
  {
    "incident_id": "INC-1010",
    "resolved_at": "2026-09-08",
    "service": "postgres-db",
    "affected_project": "reporting-service",
    "severity": "high",
    "symptoms": [
      "Database connections are rejected",
      "Reporting service cannot connect",
      "Connection pool is full"
    ],
    "error_signature": "FATAL: remaining connection slots are reserved",
    "root_cause": "Reporting workers opened too many database connections",
    "verified_fix": [
      "Reduce worker connection pool size",
      "Restart reporting workers",
      "Increase monitoring for database connections"
    ],
    "resolved_by": "Neha Iyer",
    "team": "Data Platform",
    "resolution_status": "verified",
    "lesson": "Set connection limits per application service."
  },
  {
    "incident_id": "INC-1011",
    "resolved_at": "2026-07-03",
    "service": "deployment-service",
    "affected_project": "order-service",
    "severity": "high",
    "symptoms": [
      "New deployment crashes immediately",
      "Order Service pods are restarting",
      "Configuration value is missing"
    ],
    "error_signature": "KeyError: PAYMENT_GATEWAY_URL",
    "root_cause": "Required environment variable was missing from the production deployment configuration",
    "verified_fix": [
      "Add PAYMENT_GATEWAY_URL to production configuration",
      "Redeploy Order Service",
      "Verify pod health",
      "Run checkout smoke test"
    ],
    "resolved_by": "Karan Gupta",
    "team": "DevOps",
    "resolution_status": "verified",
    "lesson": "Validate required environment variables in the CI/CD pipeline."
  },
  {
    "incident_id": "INC-1012",
    "resolved_at": "2026-09-14",
    "service": "deployment-service",
    "affected_project": "notification-service",
    "severity": "high",
    "symptoms": [
      "Deployment fails at startup",
      "Application cannot read secret",
      "Pods enter CrashLoopBackOff"
    ],
    "error_signature": "secret key not found: SMTP_PASSWORD",
    "root_cause": "Deployment configuration referenced an incorrect secret name",
    "verified_fix": [
      "Correct the secret reference",
      "Redeploy Notification Service",
      "Verify email delivery"
    ],
    "resolved_by": "Karan Gupta",
    "team": "DevOps",
    "resolution_status": "verified",
    "lesson": "Validate secret references before production deployment."
  },
  {
    "incident_id": "INC-1013",
    "resolved_at": "2026-06-28",
    "service": "notification-queue",
    "affected_project": "email-notifications",
    "severity": "medium",
    "symptoms": [
      "Customer emails are delayed",
      "Queue size keeps growing",
      "Workers process messages slowly"
    ],
    "error_signature": "queue depth above threshold",
    "root_cause": "Notification worker count was too low for the incoming email volume",
    "verified_fix": [
      "Scale notification workers",
      "Restart stuck worker",
      "Monitor queue depth"
    ],
    "resolved_by": "Sana Khan",
    "team": "Platform",
    "resolution_status": "verified",
    "lesson": "Autoscale notification workers based on queue depth."
  },
  {
    "incident_id": "INC-1014",
    "resolved_at": "2026-09-06",
    "service": "notification-queue",
    "affected_project": "email-notifications",
    "severity": "high",
    "symptoms": [
      "No confirmation emails are sent",
      "Queue backlog grows quickly",
      "Message consumers are unavailable"
    ],
    "error_signature": "consumer heartbeat timeout",
    "root_cause": "Notification queue consumers stopped after a failed deployment",
    "verified_fix": [
      "Restart queue consumers",
      "Rollback failed consumer deployment",
      "Drain queue backlog",
      "Verify confirmation email delivery"
    ],
    "resolved_by": "Sana Khan",
    "team": "Platform",
    "resolution_status": "verified",
    "lesson": "Add consumer heartbeat monitoring and deployment rollback checks."
  },
  {
    "incident_id": "INC-1015",
    "resolved_at": "2026-09-21",
    "service": "analytics-service",
    "affected_project": "business-dashboard",
    "severity": "medium",
    "symptoms": [
      "Business dashboard charts are blank",
      "New analytics report fails after schema update"
    ],
    "error_signature": "SchemaMismatchError: expected column revenue_total",
    "root_cause": "Analytics report expected an old database schema column",
    "verified_fix": [
      "Update analytics query for new schema",
      "Deploy corrected report",
      "Validate dashboard charts"
    ],
    "resolved_by": "Analytics Team",
    "team": "Analytics",
    "resolution_status": "verified",
    "lesson": "Run schema compatibility tests before releasing analytics reports."
  }
]