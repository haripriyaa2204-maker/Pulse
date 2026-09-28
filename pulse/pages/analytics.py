import streamlit as st
from .. import engine, charts, components as C
from datetime import timedelta

def render(state, go):
    a, b = st.columns([5, 1.5])
    with a: C.page_header("Analytics", "Insights for better decisions and faster response.")
    label = b.selectbox("Range", ["Last 7 Days", "Last 30 Days", "All time"], index=1, label_visibility="collapsed")
    days = {"Last 7 Days": 7, "Last 30 Days": 30, "All time": 60}[label]
    incs = [i for i in state["incidents"] if engine.parse(i["created"]) >= engine.now() - timedelta(days=days)] if label != "All time" else state["incidents"]
    s = engine.stats(state, days if label != "All time" else None)
    C.stat_cards([("▣", s["total"], "Total Incidents", label.lower(), True), ("✓", s["resolved"], "Resolved", "", True),
                  ("◔", s["active"], "Active", "", False), ("◷", f'{s["avg"]:.1f}h', "Avg. Resolution Time", "", True)])
    if not incs: st.info("No incidents in this range."); return
    span = min(days, 30)
    c1, c2 = st.columns([3, 2])
    with c1, st.container(key="panel_a1"): st.markdown("**Incidents Trend**"); st.plotly_chart(charts.trend(state, span), use_container_width=True, config=dict(displayModeBar=False))
    with c2, st.container(key="panel_a2"): st.markdown("**Incident Categories**"); st.plotly_chart(charts.categories(incs), use_container_width=True, config=dict(displayModeBar=False))
    c3, c4 = st.columns(2)
    with c3, st.container(key="panel_a3"): st.markdown("**Top Systems**"); st.plotly_chart(charts.systems(incs), use_container_width=True, config=dict(displayModeBar=False))
    with c4, st.container(key="panel_a4"):
        st.markdown(f"**Resolution Time** — avg {s['avg']:.1f}h"); st.plotly_chart(charts.resolution_time(state, span), use_container_width=True, config=dict(displayModeBar=False))
