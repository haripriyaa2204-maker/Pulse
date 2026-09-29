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

def search_old_incidents(query):
    return client.recall(
        bank_id=BANK_ID,
        query=query
    )

def save_new_incident(content):
    return client.retain(
        bank_id=BANK_ID,
        content=content
    )