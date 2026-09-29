from memory.ownership_routing import route_incident


similar_incidents = [
    {
        "incident_id": "INC-1001",
        "root_cause": "TLS certificate expired on Server Y gateway",
        "resolved_by": "Engineer A",
        "team": "Infrastructure",
        "resolved_at": "2026-05-10",
        "similarity_score": 93,
    },
    {
        "incident_id": "INC-1014",
        "root_cause": "TLS certificate renewal failure on Server Y gateway",
        "resolved_by": "Engineer B",
        "team": "Infrastructure",
        "resolved_at": "2026-09-20",
        "similarity_score": 91,
    },
]

route = route_incident(similar_incidents)

print("\n--- PERSON 3: OWNERSHIP & ROUTING ---\n")
print("Route type:", route["route_type"])
print("Likely owner:", route["owner"] or "No individual owner")
print("Fallback team:", route["team"])
print("Confidence:", f"{route['confidence_score']}%")
print("Based on incident:", route["based_on_incident"])
print("Why:", route["reason"])