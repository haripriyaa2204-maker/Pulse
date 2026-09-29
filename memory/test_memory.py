import os

from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()

BASE_URL = os.getenv("HINDSIGHT_BASE_URL", "http://localhost:8888")
BANK_ID = os.getenv("HINDSIGHT_BANK_ID", "pulse-incidents")

client = Hindsight(
    base_url=BASE_URL,
    timeout=600.0
)

query = """
Project X cannot connect to Server Y.
Error: SSL_CERTIFICATE_VERIFY_FAILED.
Find similar old incidents and their verified fixes.
"""

print("\nSearching Hindsight memory...\n", flush=True)

try:
    results = client.recall(
        bank_id=BANK_ID,
        query=query
    )

    print("--- MATCHING MEMORIES ---\n", flush=True)

    if not results.results:
        print("No matching memories were found.", flush=True)
        print(
            "First confirm that seed_hindsight.py completed successfully "
            "and saved incidents into pulse-incidents.",
            flush=True
        )
    else:
        for index, result in enumerate(results.results, start=1):
            print(f"Match {index}:", flush=True)
            print(result.text, flush=True)
            print("\n-------------------------\n", flush=True)

except Exception as error:
    print(f"Recall failed: {error}", flush=True) 
