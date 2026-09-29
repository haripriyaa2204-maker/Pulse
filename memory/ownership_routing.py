from datetime import datetime


DATE_FIELDS = (
    "resolved_at",
    "resolved_date",
    "date_resolved",
    "updated_at",
    "created_at",
)


def _parse_date(incident):
    for field in DATE_FIELDS:
        value = incident.get(field)

        if not value:
            continue

        try:
            return datetime.fromisoformat(
                str(value).replace("Z", "+00:00")
            )
        except ValueError:
            pass

        try:
            return datetime.strptime(str(value), "%Y-%m-%d")
        except ValueError:
            pass

    return datetime.min


def _person_is_valid(person):
    if not person:
        return False

    ignored_values = {
        "unknown",
        "unassigned",
        "n/a",
        "not recorded",
        "none",
    }

    return str(person).strip().lower() not in ignored_values


def _ownership_confidence(matches, selected_incident):
    score = 70

    similarity = selected_incident.get("similarity_score", 0)

    try:
        similarity = int(similarity)
    except (TypeError, ValueError):
        similarity = 0

    score += min(max(similarity, 0), 100) // 5

    if len(matches) >= 2:
        score += 10

    return min(score, 99)


def route_incident(matches):
    """
    Chooses the likely current incident owner based on the most recently
    resolved similar incident. Falls back to a team or Incident Triage.
    """
    if not matches:
        return {
            "route_type": "unassigned",
            "owner": None,
            "team": "Incident Triage",
            "confidence_score": 20,
            "reason": (
                "No similar historical incidents were found. "
                "Route to Incident Triage for initial ownership."
            ),
            "based_on_incident": None,
        }

    recent_matches = sorted(
        matches,
        key=_parse_date,
        reverse=True,
    )

    newest = recent_matches[0]

    owner = newest.get("resolved_by")
    team = newest.get("team") or "Incident Triage"
    incident_id = newest.get("incident_id", "Unknown incident")
    resolved_date = _parse_date(newest)

    if _person_is_valid(owner):
        older_owners = {
            item.get("resolved_by")
            for item in recent_matches[1:]
            if _person_is_valid(item.get("resolved_by"))
        }

        handoff_note = ""

        if older_owners and owner not in older_owners:
            handoff_note = (
                " Ownership handoff detected: earlier similar incidents "
                f"were resolved by {', '.join(sorted(older_owners))}, but "
                f"the newest comparable incident was resolved by {owner}."
            )

        return {
            "route_type": "person",
            "owner": owner,
            "team": team,
            "confidence_score": _ownership_confidence(
                recent_matches,
                newest,
            ),
            "reason": (
                f"{owner} resolved the most recent similar incident "
                f"({incident_id}) on {resolved_date.date().isoformat()}."
                + handoff_note
            ),
            "based_on_incident": incident_id,
        }

    if team:
        return {
            "route_type": "team",
            "owner": None,
            "team": team,
            "confidence_score": 60,
            "reason": (
                f"The newest similar incident ({incident_id}) has no "
                f"reliable named resolver, so route it to the {team} team."
            ),
            "based_on_incident": incident_id,
        }

    return {
        "route_type": "unassigned",
        "owner": None,
        "team": "Incident Triage",
        "confidence_score": 30,
        "reason": (
            "Similar incidents exist, but there is no reliable person "
            "or team to route to. Route to Incident Triage."
        ),
        "based_on_incident": incident_id,
    }