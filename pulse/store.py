"""JSON persistence (data/pulse_state.json)."""
import json, os, tempfile
from pathlib import Path
from . import seed

PATH = Path(__file__).resolve().parent.parent / "data" / "pulse_state.json"

def load():
    try:
        with open(PATH, encoding="utf-8") as f:
            s = json.load(f)
        base = seed.build()
        for k, v in base.items():          # backfill missing keys after upgrades
            s.setdefault(k, v)
        for k, v in base["settings"].items():
            s["settings"].setdefault(k, v)
        return s
    except (FileNotFoundError, json.JSONDecodeError):
        s = seed.build()
        save(s)
        return s

def save(state):
    PATH.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=PATH.parent, suffix=".tmp")
    with os.fdopen(fd, "w", encoding="utf-8") as f:
        json.dump(state, f, indent=2)
    os.replace(tmp, PATH)

def reset():
    s = seed.build(); save(s); return s
