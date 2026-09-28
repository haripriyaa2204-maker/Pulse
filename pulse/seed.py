"""Seed data. Times are hours-ago offsets, converted to real timestamps on first run."""
from datetime import datetime, timedelta

TEAM = [
    ("Alex Johnson", "Backend Engineer", ["Orders Service", "Database", "Payment API"]),
    ("Priya Sharma", "Full Stack Engineer", ["Search Service", "User Service"]),
    ("Rahul Verma", "DevOps Engineer", ["Infrastructure", "Search Service", "Database"]),
    ("Sneha Reddy", "QA Engineer", ["User Service"]),
    ("Vikram Singh", "Platform Engineer", ["Infrastructure", "Auth Service"]),
    ("Aisha Khan", "Security Engineer", ["Auth Service", "Payment API"]),
    ("Karan Mehta", "Frontend Engineer", ["Web App"]),
]

# n, title, service, category, status, hrs_ago, resolve_hrs, owner, error, impact, tags, root_cause, resolution, learnings
INC = [
 (1, "Redis cache eviction storm", "Infrastructure", "Infrastructure", "Resolved", 400, 3.5, "Rahul Verma", "Cache hit rate dropped to 5%", "Slow page loads", ["cache", "redis"], "maxmemory policy evicting hot keys", "Raised maxmemory and switched to allkeys-lru", ["Cache capacity alerts"]),
 (2, "Login failures for SSO users", "Auth Service", "Authentication", "Resolved", 340, 2.0, "Aisha Khan", "SAML assertion rejected", "SSO users locked out", ["auth", "sso"], "Identity provider clock skew", "Synced NTP and widened assertion validity window", ["NTP monitoring"]),
 (3, "Database replica lag", "Database", "Database", "Resolved", 300, 4.2, "Alex Johnson", "Replica lag > 120s", "Stale reads in reports", ["database", "replication"], "Long-running analytics query blocking replay", "Killed query, moved analytics to a dedicated replica", ["Isolate analytics workloads"]),
 (4, "Search returning empty results", "Search Service", "API / Service", "Resolved", 260, 1.8, "Priya Sharma", "Index shard unassigned", "Search unusable", ["search", "elasticsearch"], "Disk watermark hit on one node", "Freed disk and rerouted shards", ["Disk watermark alerts"]),
 (5, "Checkout page intermittent 500s", "Payment API", "API / Service", "Resolved", 200, 2.6, "Alex Johnson", "Upstream 500 from payment gateway", "Failed checkouts", ["payment", "third-party"], "Gateway rate limit exceeded", "Added retry with backoff and raised quota", ["Gateway quota tracking"]),
 (6, "Web app blank page on Safari", "Web App", "API / Service", "Resolved", 150, 1.2, "Karan Mehta", "Uncaught TypeError in bundle", "Safari users blocked", ["frontend", "browser"], "Unsupported syntax in transpiled bundle", "Adjusted build targets and redeployed", ["Cross-browser CI"]),
 (7, "High CPU on user service pods", "User Service", "Infrastructure", "Resolved", 120, 3.9, "Priya Sharma", "CPU throttling", "Slow profile API", ["cpu", "kubernetes"], "Missing index causing full scans", "Added index and scaled pods", ["Query plan review"]),
 (8, "Service unavailable on user service", "User Service", "API / Service", "Monitoring", 96, None, "Priya Sharma", "503 Service Unavailable", "Intermittent profile errors", ["availability", "503"], "", "", []),
 (9, "Auth token refresh loop", "Auth Service", "Authentication", "In Progress", 72, None, "Vikram Singh", "Token refresh returns 401", "Users re-login repeatedly", ["auth", "token"], "", "", []),
 (10, "DB connection refused", "Database", "Database", "Monitoring", 60, None, "Alex Johnson", "FATAL: too many connections", "Batch jobs failing", ["database", "connection-pool"], "", "", []),
 (11, "Database latency spike", "Database", "Database", "In Progress", 72, None, "Rahul Verma", "p99 query latency 4s", "Slow dashboards", ["database", "performance"], "", "", []),
 (12, "Payment API error", "Payment API", "API / Service", "Investigating", 48, None, "Aisha Khan", "HTTP 502 from provider", "Payments delayed", ["payment", "third-party"], "", "", []),
 (13, "SSL certificate error", "Infrastructure", "Authentication", "Investigating", 30, None, "Vikram Singh", "Certificate expired", "Browser warnings", ["ssl", "certificate"], "", "", []),
 (14, "API timeout on search service", "Search Service", "API / Service", "In Progress", 6, None, "Rahul Verma", "Gateway timeout 504", "Search slow for some users", ["api", "timeout"], "", "", []),
 (15, "Payment API error (retry storm)", "Payment API", "API / Service", "Investigating", 4, None, "Alex Johnson", "Retries amplifying load", "Payments delayed", ["payment", "retry"], "", "", []),
 (16, "Orders DB is refusing new connections", "Orders Service", "Database", "Investigating", 2, None, "Alex Johnson", "DB connection refused", "Orders not processing", ["database", "connection error"], "", "", []),
]

def build():
    now = datetime.now()
    incidents, memories = [], []
    for (n, title, svc, cat, st, hrs, rh, owner, err, imp, tags, rc, res, learn) in INC:
        created = now - timedelta(hours=hrs)
        inc = dict(id=f"INC-{n:03d}", title=title, service=svc, env="Production", category=cat, status=st,
                   created=created.isoformat(timespec="seconds"), resolved_at=None, owner=owner, error=err,
                   impact=imp, tags=tags, root_cause=rc, resolution=res, learnings=learn, notified=None,
                   events=[dict(t=created.isoformat(timespec="seconds"), text="Incident reported")])
        if st == "Resolved":
            inc["resolved_at"] = (created + timedelta(hours=rh)).isoformat(timespec="seconds")
            inc["events"].append(dict(t=inc["resolved_at"], text="Resolved and added to memory"))
            memories.append(dict(incident_id=inc["id"], root_cause=rc, resolution=res, tags=tags,
                                 learnings=learn, saved_at=inc["resolved_at"]))
        incidents.append(inc)
    team = [dict(name=n, role=r, status="On Leave" if n in ("Sneha Reddy", "Karan Mehta") else "Active", owns=o) for n, r, o in TEAM]
    settings = dict(user_name="Prakeerthi", user_role="Incident Lead", org="Your Team", tz="(UTC+05:30) India Standard Time",
                    view="Home", ai_suggestions=True, auto_similar=True, notify_owner=True, demo_mode=False,
                    skip_anim=False, email_digest=True, slack_alerts=False)
    return dict(incidents=incidents, team=team, memories=memories, settings=settings, notifications=[])
