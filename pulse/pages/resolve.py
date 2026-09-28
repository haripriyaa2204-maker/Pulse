import streamlit as st
from .. import engine, components as C, store
from ..components import e

def _save(state, iid):
    ss = st.session_state
    tags = [t.strip() for t in ss.rs_tags.split(",") if t.strip()]
    learn = [l.strip() for l in ss.rs_learn.splitlines() if l.strip()]
    engine.resolve_and_teach(state, iid, ss.rs_root.strip(), ss.rs_res.strip(), learn, tags)
    ss.rs_done = iid

def render(state, go):
    ss = st.session_state
    C.page_header("Resolve & Teach", "Confirm the resolution and add this incident to memory for future learning.")
    if ss.get("rs_done"):
        st.markdown('<div class="succ"><div class="tick">✓</div><div class="pg-t">Memory Updated!</div><div class="pg-s">The incident has been added to your team\'s memory<br>and is ready for future learning.</div></div>', unsafe_allow_html=True)
        st.metric("Memories in team memory", len(state["memories"]))
        a, b = st.columns(2)
        a.button("View in Memory", type="primary", use_container_width=True, on_click=go, args=("memory",), key="vm")
        b.button("Back to Home", use_container_width=True, on_click=go, args=("home",), key="bh")
        return
    inc = engine.get(state, ss.get("sel", ""))
    if not inc:
        cand = [i for i in state["incidents"] if i["status"] != "Resolved"]
        if not cand: st.info("No open incidents to resolve."); return
        pick = st.selectbox("Choose an incident", [f'{i["id"]} — {i["title"]}' for i in cand])
        inc = engine.get(state, pick.split(" — ")[0])
    key = f"rs_init_{inc['id']}"
    if ss.get("rs_for") != inc["id"]:
        ss.rs_for = inc["id"]
        sim = next((s for _, s in engine.similar_to(state, inc, 5) if s["resolution"]), None)
        ss.rs_root = inc["root_cause"] or (sim["root_cause"] if sim else "")
        ss.rs_res = inc["resolution"] or (sim["resolution"] if sim else "")
        ss.rs_learn = "\n".join(inc["learnings"] or (sim["learnings"] if sim else []))
        ss.rs_tags = ", ".join(inc["tags"])
    st.markdown(f'<div class="pcard"><div class="row"><div class="sq">▣</div><div><div class="sub">Current Incident</div><span class="iid">{e(inc["id"])}</span><div class="ttl">{e(inc["title"])}</div>'
                f'<div class="sub">{engine.ago(inc["created"])} · {e(inc["env"])} · {e(inc["service"])}</div></div></div></div>', unsafe_allow_html=True)
    st.caption("Fields are prefilled from the most similar resolved incident when available — edit them to match what actually happened.")
    l, r = st.columns(2)
    with l, st.container(key="panel_rs1"):
        st.text_area("Root cause", key="rs_root", height=110); st.text_area("Resolution", key="rs_res", height=110)
    with r, st.container(key="panel_rs2"):
        st.text_area("Key learnings (one per line)", key="rs_learn", height=110)
        st.markdown("".join(f'<div class="stage"><span class="d">✓</span>{e(x)}</div>' for x in ss.rs_learn.splitlines() if x.strip()), unsafe_allow_html=True)
    with st.container(key="panel_rs3"):
        st.text_input("Add to Memory — tags (comma separated)", key="rs_tags")
        ok = bool(ss.rs_root.strip() and ss.rs_res.strip())
        if not ok: st.caption("Root cause and resolution are required.")
        st.button("Save to Memory →", type="primary", disabled=not ok, on_click=_save, args=(state, inc["id"]), key="save_mem")
