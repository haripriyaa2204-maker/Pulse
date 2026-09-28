"""Search, similarity, owner inference, stats, and state mutations."""
import re, difflib
from datetime import datetime, timedelta
from . import store

ACTIVE = ("Investigating", "In Progress", "Monitoring")
STATUSES = ("Investigating", "In Progress", "Monitoring", "Resolved")
STOP = {"the", "a", "an", "is", "on", "in", "to", "of", "for", "and", "with", "are", "new", "from", "at", "by"}

def now(): return datetime.now()
def parse(iso): return datetime.fromisoformat(iso)

def ago(iso):
    s = (now() - parse(iso)).total_seconds()
    if s < 3600: return f"{max(1, int(s // 60))}m ago"
    if s < 86400: return f"{int(s // 3600)}h ago"
    return f"{int(s // 86400)}d ago"

def _tok(t): return {w[:6] for w in re.findall(r"[a-z0-9]+", t.lower()) if w not in STOP and len(w) > 1}

FIELDS = {
    "All": ("title", "service", "category", "error", "impact", "root_cause", "resolution", "tags"),
    "Incidents": ("title", "error", "impact", "tags"),
    "Resolutions": ("resolution", "learnings"),
    "Root Causes": ("root_cause", "error"),
    "By System": ("service", "category"),
    "Last 30 Days": ("title", "service", "category", "error", "root_cause", "resolution", "tags"),
}

def text_of(inc, fields=FIELDS["All"]):
    return " ".join(" ".join(v) if isinstance(v, list) else str(v or "") for v in (inc.get(f) for f in fields))

def score(query, inc, fields=FIELDS["All"]):
    """0..1 similarity between free text and an incident."""
    q, blob = _tok(query), text_of(inc, fields)
    b = _tok(blob)
    if not q or not b: return 0.0
    inter = len(q & b)
    fuzzy = difflib.SequenceMatcher(None, query.lower(), inc["title"].lower()).ratio()
    sub = 1.0 if query.lower().strip() in blob.lower() else 0.0
    return min(1.0, 0.55 * inter / len(q) + 0.2 * inter / len(q | b) + 0.15 * fuzzy + 0.1 * sub)

def search(state, query="", scope="All", status="All", service="All", limit=50):
    res = []
    fields = FIELDS.get(scope, FIELDS["All"])
    cutoff = now() - timedelta(days=30)
    q = query.strip()
    for inc in state["incidents"]:
        if status != "All" and inc["status"] != status: continue
        if service != "All" and inc["service"] != service: continue
        if scope == "Last 30 Days" and parse(inc["created"]) < cutoff: continue
        if scope == "Resolutions" and not inc.get("resolution"): continue
        if scope == "Root Causes" and not inc.get("root_cause"): continue
        s = score(q, inc, fields) if q else 0.0
        if q and s < 0.15: continue
        res.append((s, inc))
    if q: res.sort(key=lambda x: -x[0])
    else: res.sort(key=lambda x: x[1]["created"], reverse=True)
    return res[:limit]

def similar_to(state, inc, n=3):
    q = text_of(inc, ("title", "error", "service", "tags", "root_cause"))
    r = [(score(q, o), o) for o in state["incidents"] if o["id"] != inc["id"]]
    return sorted([x for x in r if x[0] > 0.15], key=lambda x: -x[0])[:n]

def infer_owner(state, inc):
    """Likely owner from service ownership, recent activity and similar past resolutions."""
    pool = [m for m in state["team"] if m["status"] == "Active"] or state["team"]
    if not pool: return None
    sims = [(s, o) for s, o in similar_to(state, inc, 6) if o["status"] == "Resolved" and o.get("owner")]
    week = (now() - timedelta(days=7)).isoformat()
    best = None
    for m in pool:
        s, why = 0.0, []
        if inc["service"] in m["owns"]: s += 0.5; why.append(f"owns {inc['service']}")
        prev = sum(sc for sc, o in sims if o["owner"] == m["name"])
        if prev: s += min(0.35, prev * 0.6); why.append("resolved similar incidents")
        if any(o.get("owner") == m["name"] and o["created"] >= week for o in state["incidents"]):
            s += 0.1; why.append("recent activity")
        if best is None or s > best[0]: best = (s, m, why)
    s, m, why = best
    return dict(member=m, confidence=int(max(30, min(96, 35 + s * 65))), reasons=why or ["team availability"])

def hours_to_resolve(inc):
    return (parse(inc["resolved_at"]) - parse(inc["created"])).total_seconds() / 3600 if inc.get("resolved_at") else None

def stats(state, days=None):
    incs = state["incidents"]
    if days: incs = [i for i in incs if parse(i["created"]) >= now() - timedelta(days=days)]
    hrs = [h for h in (hours_to_resolve(i) for i in incs) if h is not None]
    return dict(total=len(incs), active=sum(i["status"] in ACTIVE for i in incs),
                resolved=sum(i["status"] == "Resolved" for i in incs),
                avg=(sum(hrs) / len(hrs)) if hrs else 0.0)

def trend(state, pred):
    """Week-over-week change for incidents matching pred; returns (text, is_up)."""
    def cnt(a, b):
        return sum(1 for i in state["incidents"] if now() - timedelta(days=b) <= parse(i["created"]) < now() - timedelta(days=a) and pred(i))
    cur, prev = cnt(0, 7), cnt(7, 14)
    if prev == 0: return ("new this week" if cur else "no change"), cur > 0
    ch = round((cur - prev) / prev * 100)
    return f"{'+' if ch >= 0 else ''}{ch}% vs last week", ch >= 0

def get(state, iid): return next((i for i in state["incidents"] if i["id"] == iid), None)

def _event(inc, text): inc["events"].append(dict(t=now().isoformat(timespec="seconds"), text=text))

def create_incident(state, title, service, error, impact, env="Production"):
    n = max(int(i["id"].split("-")[1]) for i in state["incidents"]) + 1
    inc = dict(id=f"INC-{n:03d}", title=title, service=service, env=env, category="API / Service", status="Investigating",
               created=now().isoformat(timespec="seconds"), resolved_at=None, owner=None, error=error or title,
               impact=impact or "Under assessment", tags=sorted(_tok(title))[:3], root_cause="", resolution="",
               learnings=[], notified=None, events=[])
    _event(inc, "Incident reported")
    state["incidents"].append(inc)
    o = infer_owner(state, inc)
    if o: inc["owner"] = o["member"]["name"]
    store.save(state)
    return inc

def set_status(state, iid, status):
    inc = get(state, iid)
    inc["status"] = status
    _event(inc, f"Status changed to {status}")
    store.save(state)

def notify_owner(state, iid, name):
    inc = get(state, iid)
    inc["notified"] = name
    _event(inc, f"{name} notified as likely owner")
    state["notifications"].insert(0, dict(t=now().isoformat(timespec="seconds"), text=f"{name} notified about {iid}"))
    store.save(state)

def resolve_and_teach(state, iid, root_cause, resolution, learnings, tags):
    inc = get(state, iid)
    inc.update(status="Resolved", resolved_at=now().isoformat(timespec="seconds"), root_cause=root_cause,
               resolution=resolution, learnings=learnings, tags=sorted(set(inc["tags"]) | set(tags)))
    _event(inc, "Resolved and added to memory")
    state["memories"] = [m for m in state["memories"] if m["incident_id"] != iid]
    state["memories"].append(dict(incident_id=iid, root_cause=root_cause, resolution=resolution, tags=tags,
                                  learnings=learnings, saved_at=inc["resolved_at"]))
    store.save(state)
