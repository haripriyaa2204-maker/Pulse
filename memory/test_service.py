from memory.hindsight_service import search_old_incidents

query = """
Project X cannot connect to Server Y.
SSL_CERTIFICATE_VERIFY_FAILED.
Find the root cause and verified fix from old incidents.
"""

print("\n--- PERSON 2 SERVICE TEST ---\n", flush=True)

try:
    results = search_old_incidents(query)

    if not results.results:
        print("No matching incident memories found.", flush=True)
    else:
        for number, result in enumerate(results.results[:10], start=1):
            print(f"Match {number}:", flush=True)
            print(result.text, flush=True)
            print("\n-------------------------\n", flush=True)

except Exception as error:
    print(f"Service test failed: {error}", flush=True)
