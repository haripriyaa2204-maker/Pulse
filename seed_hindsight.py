import json
import os
import time

from dotenv import load_dotenv
from hindsight_client import Hindsight

load_dotenv()

BASE_URL = os.getenv("HINDSIGHT_BASE_URL", "http://localhost:8888")
BANK_ID = os.getenv("HINDSIGHT_BANK_ID", "pulse-incidents")

client = Hindsight(
    base_url=BASE_URL,
    timeout=60.0
)

with open("memory/incidents.json", "r", encoding="utf-8") as file:
    incidents = json.load(file)

print(f"Found {len(incidents)} incidents.", flush=True)
print(f"Queueing incidents in Hindsight bank: {BANK_ID}\n", flush=True)

for incident in incidents:
    incident_id = incident.get("id", "UNKNOWN")
    memory_text = json.dumps(incident, indent=2)

    print(f"Queueing: {incident_id}...", flush=True)

    try:
        response = client.retain(
            bank_id=BANK_ID,
            content=memory_text,
            retain_async=True
        )

        operation_id = getattr(response, "operation_id", None)

        if operation_id:
            print(f"Queued: {incident_id} | operation: {operation_id}\n", flush=True)
        else:
            print(f"Queued: {incident_id}\n", flush=True)

        time.sleep(2)

    except Exception as error:
        print(f"FAILED TO QUEUE: {incident_id}", flush=True)
        print(f"Reason: {error}\n", flush=True)

print("Queueing finished.", flush=True)
print("Keep Docker/Hindsight running while it processes the incidents.", flush=True)