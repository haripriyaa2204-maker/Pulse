from memory.diagnosis import diagnose_incident

problem = """
Project X cannot connect to Server Y.
Error: SSL_CERTIFICATE_VERIFY_FAILED.
TLS handshake failed.
"""

matches = diagnose_incident(problem)

print("\n--- PERSON 2: MATCHING & DIAGNOSIS ---\n")

if not matches:
    print("No similar incidents found.")
else:
    for match in matches:
        print(f"Match {match['rank']} — {match['similarity_score']}% similarity")
        print("Matched memory:", match["matched_incident"])
        print("Why it matched:", match["why_matched"])
        print("\n-------------------------\n")