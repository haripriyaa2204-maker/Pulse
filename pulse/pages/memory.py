import streamlit as st
from .. import engine, components as C

def render(state, go):
    C.page_header("Search Memory", "Find similar incidents, solutions and the right owner from your team's memory.")
    st.text_input("Search", key="mem_q", placeholder="e.g. Database connection error", label_visibility="collapsed")
    scope = st.segmented_control("Filter", list(engine.FIELDS), default="All", key="mem_scope", label_visibility="collapsed") or "All"
    a, b, c = st.columns(3)
    status = a.selectbox("Status", ["All", *engine.STATUSES], key="mem_status")
    service = b.selectbox("System", ["All", *sorted({i["service"] for i in state["incidents"]})], key="mem_service")
    c.metric("Memories saved", len(state["memories"]))
    res = engine.search(state, st.session_state.get("mem_q", ""), scope, status, service)
    st.caption(f"{len(res)} result(s)")
    if not res: st.info("Nothing matched. Try fewer words or clear the filters.")
    for sc, inc in res:
        C.clickable(f"mr_{inc['id']}", C.incident_row(inc, sc if st.session_state.get("mem_q", "").strip() else None), go, "detail", sel=inc["id"])
