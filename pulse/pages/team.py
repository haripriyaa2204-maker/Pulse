import streamlit as st
from .. import components as C, store
from ..components import e

def _toggle(state, name):
    for m in state["team"]:
        if m["name"] == name: m["status"] = "On Leave" if m["status"] == "Active" else "Active"
    store.save(state)

def _add(state):
    ss = st.session_state
    n, r = ss.get("nm_name", "").strip(), ss.get("nm_role", "").strip()
    if n and r and not any(m["name"].lower() == n.lower() for m in state["team"]):
        state["team"].append(dict(name=n, role=r, status="Active", owns=[s.strip() for s in ss.get("nm_owns", "").split(",") if s.strip()], new=True))
        store.save(state); ss.nm_name = ss.nm_role = ss.nm_owns = ""

def render(state, go):
    a, b = st.columns([5, 1.3])
    with a: C.page_header("Team", "The people behind every resolution.")
    with b.popover("+ Add Member", use_container_width=True):
        st.text_input("Name", key="nm_name"); st.text_input("Role", key="nm_role"); st.text_input("Owns services (comma separated)", key="nm_owns")
        st.button("Add", type="primary", on_click=_add, args=(state,), key="addm")
    t = state["team"]
    C.stat_cards([("☺", len(t), "Total Members", "", True), ("✓", sum(m["status"] == "Active" for m in t), "Active", "", True),
                  ("☾", sum(m["status"] == "On Leave" for m in t), "On Leave", "", False), ("+", sum(1 for m in t if m.get("new")), "New", "", True)])
    C.section("Team Members")
    q = st.text_input("Search team", placeholder="Search team members...", label_visibility="collapsed")
    ms = [m for m in t if q.lower() in (m["name"] + m["role"] + " ".join(m["owns"])).lower()]
    for i in range(0, len(ms), 4):
        for col, m in zip(st.columns(4), ms[i:i + 4]):
            with col, st.container(key=f"panel_m_{m['name']}"):
                st.markdown(f'<div style="text-align:center"><div style="display:flex;justify-content:center">{C.avatar(m["name"], True)}</div><div class="ttl" style="margin-top:8px">{e(m["name"])}</div>'
                            f'<div class="sub">{e(m["role"])}</div><div style="margin:8px 0">{C.badge(m["status"])}</div><div class="sub">{e(", ".join(m["owns"][:2]) or "—")}</div></div>', unsafe_allow_html=True)
                st.button("Set on leave" if m["status"] == "Active" else "Set active", key=f"tg_{m['name']}", on_click=_toggle, args=(state, m["name"]), use_container_width=True)
