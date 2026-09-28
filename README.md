# Pulse — AI incident memory (Streamlit)

    pip install -r requirements.txt
    python3 -m streamlit run app.py

Data persists in `data/pulse_state.json` (created on first run). Settings → Data & Privacy can reset it.
Structure: `app.py` (shell/nav) · `pulse/theme.py` (CSS) · `pulse/engine.py` (search, similarity, owner inference) ·
`pulse/store.py` (persistence) · `pulse/seed.py` · `pulse/charts.py` · `pulse/pages/*`.
