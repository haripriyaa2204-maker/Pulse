import time
import streamlit as st
from .. import engine, components as C
from ..components import e

HERO_SVG = """<svg viewBox="0 0 320 200" width="100%" style="max-width:340px"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8E86F5"/><stop offset="1" stop-color="#6655E8"/></linearGradient></defs>
<rect x="50" y="30" width="190" height="125" rx="14" fill="url(#g)"/><rect x="60" y="40" width="170" height="105" rx="8" fill="#fff" opacity=".93"/>
<g stroke="#A9A4F7" stroke-width="2"><line x1="95" y1="75" x2="145" y2="100"/><line x1="145" y1="100" x2="195" y2="70"/><line x1="145" y1="100" x2="170" y2="130"/><line x1="95" y1="75" x2="110" y2="125"/></g>
<g fill="#6655E8"><circle cx="95" cy="75" r="9"/><circle cx="145" cy="100" r="13"/><circle cx="195" cy="70" r="8" fill="#73B9EA"/><circle cx="170" cy="130" r="7" fill="#55CFA5"/><circle cx="110" cy="125" r="7" fill="#F4B86A"/></g>
<rect x="30" y="155" width="230" height="10" rx="5" fill="#C9C5F7"/><path d="M262 60l28 10v26c0 18-12 30-28 36-16-6-28-18-28-36V70z" fill="#73B9EA" opacity=".9"/><path d="M251 96l8 8 15-16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></svg>"""

STAGES = ["Reading incident", "Searching memory", "Finding similar incidents", "Comparing root causes",
          "Tracing resolution history", "Identifying likely owner", "Building resolution path"]

def _analysis(state, inc):
    st.markdown("#### AI analysis results")
    o = engine.infer_owner(state, inc)
    sims = engine.similar_to(state, inc, 3)
    c1, c2 = st.columns([3, 2])
    with c1, st.container(key="panel_res"):
        st.markdown("**Similar incidents from memory**")
        if not sims: st.caption("No close matches yet — this looks new. Resolve it and teach memory.")
        for s, o2 in sims:
            st.markdown(f'<div class="kv"><div class="grow"><small>{e(o2["id"])} · {int(s*100)}% match · {e(o2["status"])}</small>'
                        f'<b>{e(o2["title"])}</b><small>Previous resolution: {e(o2["resolution"] or "not yet resolved")}</small></div></div>', unsafe_allow_html=True)
    with c2, st.container(key="panel_own"):
        st.markdown("**Likely owner**")
        if o:
            st.markdown(f'<div class="row">{C.avatar(o["member"]["name"])}<div class="grow"><b>{e(o["member"]["name"])}</b><div class="sub">{e(o["member"]["role"])}</div></div>{C.ring(o["confidence"])}</div>'
                        f'<div class="sub" style="margin-top:8px">{C.owner_line(o)}</div>', unsafe_allow_html=True)
    st.button("Open incident →", type="primary", key="open_new", on_click=st.session_state.go, args=("detail",), kwargs=dict(sel=inc["id"]))

def render(state, go):
    s = state["settings"]
    with st.container(key="hero"):
        l, r = st.columns([3, 2])
        with l:
            st.markdown(f'<div class="hero-t">Good morning, {e(s["user_name"])}! 👋</div><div class="hero-s">Your AI-powered incident memory is here to help you resolve faster and learn better.</div>', unsafe_allow_html=True)
            with st.form("home_search", border=False):
                a, b = st.columns([6, 1.2])
                q = a.text_input("q", key="home_q_in", placeholder="Search for an incident, service, or keyword...", label_visibility="collapsed")
                if b.form_submit_button("Search", type="primary", use_container_width=True): st.session_state.home_q = q
        r.markdown(HERO_SVG, unsafe_allow_html=True)

    hq = st.session_state.get("home_q", "").strip()
    if hq:
        C.section(f'Memory results for “{hq}”')
        res = engine.search(state, hq, limit=5)
        if not res: st.info("No matching incidents in memory. Try a service name or an error keyword.")
        for sc, inc in res:
            own = engine.infer_owner(state, inc)
            ev = inc["root_cause"] or inc["error"]
            body = C.incident_row(inc, sc) + (f'<div class="sub" style="margin-top:10px"><b>Previous resolution:</b> {e(inc["resolution"] or "Not resolved yet")}<br>'
                   f'<b>Evidence:</b> {e(ev)} · <b>Likely owner:</b> {e(own["member"]["name"]) if own else "—"} ({own["confidence"] if own else 0}%)</div>')
            C.clickable(f"hs_{inc['id']}", body, go, "detail", sel=inc["id"])
        if st.button("Clear search"): st.session_state.home_q = ""; st.rerun()

    st_all = engine.stats(state)
    t1, u1 = engine.trend(state, lambda i: True); t2, u2 = engine.trend(state, lambda i: i["status"] in engine.ACTIVE)
    t3, u3 = engine.trend(state, lambda i: i["status"] == "Resolved")
    C.stat_cards([("▣", st_all["total"], "Total Incidents", t1, u1), ("◔", st_all["active"], "Active Incidents", t2, not u2),
                  ("✓", st_all["resolved"], "Resolved Incidents", t3, u3), ("◷", f'{st_all["avg"]:.1f}h', "Avg. Resolution Time", f'{len(state["memories"])} memories', True)])

    C.section("How Pulse remembers"); C.workflow()

    C.section("Recent Incidents")
    recent = sorted(state["incidents"], key=lambda i: i["created"], reverse=True)[:4]
    for col, inc in zip(st.columns(4), recent):
        with col: C.clickable(f"rc_{inc['id']}", C.incident_card(inc), go, "detail", sel=inc["id"])
    st.button("View all →", on_click=go, args=("memory",), key="viewall")

    C.section("Report a new incident")
    with st.expander("Analyze a new incident", expanded=bool(st.session_state.get("last_new"))):
        demo = s["demo_mode"]
        if demo: st.caption("Demo mode is on — guided sample prefilled. Stages will animate unless 'Skip animation' is enabled in Settings.")
        with st.form("new_inc"):
            t = st.text_input("Title", value="Orders API returning 500 after connection pool errors" if demo else "")
            svcs = sorted({i["service"] for i in state["incidents"]})
            sv = st.selectbox("Service", svcs, index=svcs.index("Orders Service") if demo and "Orders Service" in svcs else 0)
            er = st.text_input("Error message", value="DB connection refused" if demo else "")
            im = st.text_input("Impact", value="Orders not processing" if demo else "")
            go_btn = st.form_submit_button("Analyze with Pulse", type="primary")
        if go_btn:
            if not t.strip(): st.warning("Please enter a title.")
            else:
                box = st.empty(); bar = st.progress(0)
                animate = s["demo_mode"] and not s["skip_anim"]
                for n, stg in enumerate(STAGES, 1):
                    if animate:
                        box.markdown("".join(f'<div class="stage"><span class="d">{"✓" if k < n else "…"}</span>{x}</div>' for k, x in enumerate(STAGES[:n], 1)), unsafe_allow_html=True)
                        bar.progress(n / len(STAGES)); time.sleep(0.6)
                inc = engine.create_incident(state, t.strip(), sv, er, im)
                box.empty(); bar.empty()
                st.session_state.last_new = inc["id"]
        if st.session_state.get("last_new"):
            inc = engine.get(state, st.session_state.last_new)
            if inc:
                st.markdown("".join(f'<div class="stage"><span class="d">✓</span>{x}</div>' for x in STAGES), unsafe_allow_html=True)
                _analysis(state, inc)
