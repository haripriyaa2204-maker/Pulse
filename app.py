"""Pulse — AI incident memory. Run: python3 -m streamlit run app.py"""
import traceback
import streamlit as st

st.set_page_config(page_title="Pulse", page_icon="💜", layout="wide", initial_sidebar_state="auto")

from pulse import store, theme, engine
from pulse import components as C
from pulse.pages import home, memory, detail, team, analytics, settings, resolve

theme.inject()
ss = st.session_state
if "state" not in ss:
    ss.state = store.load()
    ss.page = ss.state["settings"]["view"].lower()
state = ss.state

def go(page, **kw):
    ss.page = page
    for k, v in kw.items(): ss[k] = v
    if page != "resolve": ss.rs_done = None
ss.go = go

def _top_search():
    ss.mem_q = ss.top_q; ss.top_q = ""; go("memory")

NAV = [("home", "Home", ":material/home:"), ("memory", "Memory", ":material/psychology:"), ("team", "Team", ":material/group:"),
       ("analytics", "Analytics", ":material/bar_chart:"), ("settings", "Settings", ":material/settings:")]
active = {"detail": "memory", "resolve": "memory"}.get(ss.page, ss.page)

with st.sidebar:
    st.markdown('<div class="logo"><i>∿</i>Pulse</div>', unsafe_allow_html=True)
    for key, label, icon in NAV:
        st.button(label, icon=icon, key=f"{'navon' if key == active else 'navoff'}-{key}", on_click=go, args=(key,), use_container_width=True)
    st.markdown('<div class="side-card">Better<br>Incidents.<br>Smarter<br>Teams.<small>Remember. Resolve. Rebuild.</small></div>', unsafe_allow_html=True)
    u = state["settings"]
    st.markdown(f'<div class="prof">{C.avatar(u["user_name"])}<div><b>{C.e(u["user_name"])}</b><span>{C.e(u["user_role"])}<br>● Synced · {len(state["memories"])} memories</span></div></div>', unsafe_allow_html=True)

a, b = st.columns([8, 1])
a.text_input("Top search", key="top_q", placeholder="Search incidents, services, or keywords...", label_visibility="collapsed", on_change=_top_search)
with b.popover(f"🔔 {len(state['notifications'])}" if state["notifications"] else "🔔"):
    if not state["notifications"]: st.caption("No notifications yet.")
    for n in state["notifications"][:8]: st.markdown(f"- {n['text']} · {engine.ago(n['t'])}")

PAGES = dict(home=home, memory=memory, detail=detail, team=team, analytics=analytics, settings=settings, resolve=resolve)
try:
    PAGES.get(ss.page, home).render(state, go)
except Exception:
    st.error("Something unexpected happened. Your data is safe.")
    with st.expander("Technical details"):
        st.code(traceback.format_exc())
