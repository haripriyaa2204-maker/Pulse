import streamlit as st
from .. import engine, components as C
from ..components import e

def _notify(state, iid, name):
    engine.notify_owner(state, iid, name)

def render(state, go):
    inc = engine.get(state, st.session_state.get("sel", ""))
    if not inc:
        st.info("Select an incident from Home or Memory."); st.button("Go to Memory", on_click=go, args=("memory",)); return
    st.button("← Back to Memory", on_click=go, args=("memory",), key="back")
    st.markdown(f'<div class="row"><div class="sq">▣</div><div class="grow"><span class="iid" style="font-size:22px;font-family:Poppins">{e(inc["id"])}</span> &nbsp;{C.badge(inc["status"])}'
                f'<div class="ttl" style="font-size:18px">{e(inc["title"])}</div><div class="sub">{engine.ago(inc["created"])} · {e(inc["env"])} · {e(inc["service"])}</div></div></div>', unsafe_allow_html=True)
    a, b, _ = st.columns([1.3, 1.6, 3])
    if inc["status"] != "Resolved":
        a.button("Resolve & Teach", type="primary", on_click=go, args=("resolve",), kwargs=dict(sel=inc["id"]), key="to_resolve")
        ns = b.selectbox("Status", engine.STATUSES[:3], index=engine.STATUSES.index(inc["status"]), label_visibility="collapsed", key=f"stsel_{inc['id']}")
        if ns != inc["status"]: engine.set_status(state, inc["id"], ns); st.rerun()
    tabs = st.tabs(["Overview", "Root Cause", "Resolution History", "Similar Incidents"])
    o = engine.infer_owner(state, inc)
    with tabs[0]:
        l, r = st.columns([3, 2])
        with l, st.container(key="panel_det"):
            st.markdown("**Incident Details**")
            rows = [("Service", inc["service"]), ("Environment", inc["env"]), ("Error", inc["error"]), ("Detected", engine.ago(inc["created"])), ("Impact", inc["impact"])]
            st.markdown("".join(f'<div class="kv"><div><small>{k}</small><b>{e(v)}</b></div></div>' for k, v in rows), unsafe_allow_html=True)
        with r, st.container(key="panel_own"):
            st.markdown("**Likely Owner**")
            if o:
                m = o["member"]
                st.markdown(f'<div class="row">{C.avatar(m["name"], True)}<div class="grow"><b>{e(m["name"])}</b><div class="sub">{e(m["role"])}</div></div>{C.ring(o["confidence"])}</div>'
                            f'<div class="sub" style="margin:10px 0">Ownership Confidence: {o["confidence"]}%. {C.owner_line(o)}</div>', unsafe_allow_html=True)
                first = m["name"].split()[0]
                st.button(f"Notify {first} →", type="primary", use_container_width=True, key="notify", on_click=_notify, args=(state, inc["id"], m["name"]))
                if inc.get("notified"): st.markdown(f'<div class="ok">✓ {e(inc["notified"].split()[0])} has been notified</div>', unsafe_allow_html=True)
        C.section("Similar Incidents")
        sims = engine.similar_to(state, inc, 3)
        for col, (sc, s) in zip(st.columns(3), sims):
            with col: C.clickable(f"ds_{s['id']}", C.incident_card(s), go, "detail", sel=s["id"])
        if not sims: st.caption("No similar incidents found.")
    with tabs[1]:
        if inc["root_cause"]: st.success(f"Root cause: {inc['root_cause']}")
        else: st.info("Root cause not confirmed yet. Likely candidates from similar past incidents:")
        for sc, s in engine.similar_to(state, inc, 3):
            if s["root_cause"]: st.markdown(f"- **{s['id']}** ({int(sc*100)}% match): {s['root_cause']}")
    with tabs[2]:
        st.markdown("**Timeline**")
        for ev in reversed(inc["events"]): st.markdown(f"- {engine.ago(ev['t'])} — {ev['text']}")
        if inc["resolution"]: st.success(f"Resolution: {inc['resolution']}")
        past = [s for _, s in engine.similar_to(state, inc, 5) if s["resolution"]]
        if past:
            st.markdown("**Resolutions from similar incidents**")
            for s in past: st.markdown(f"- **{s['id']}**: {s['resolution']}")
    with tabs[3]:
        for sc, s in engine.similar_to(state, inc, 6):
            C.clickable(f"dt_{s['id']}", C.incident_row(s, sc), go, "detail", sel=s["id"])
