"""Plotly charts driven by stored incident data."""
from collections import Counter
from datetime import timedelta
import plotly.graph_objects as go
from . import engine

PAL = ["#6655E8", "#8E86F5", "#73B9EA", "#55CFA5", "#F4B86A", "#EA7897"]

def _base(fig, h=250):
    fig.update_layout(height=h, margin=dict(l=8, r=8, t=8, b=8), paper_bgcolor="rgba(0,0,0,0)", plot_bgcolor="rgba(0,0,0,0)",
                      font=dict(family="Inter", color="#77759A", size=11), legend=dict(orientation="h", y=-0.2), transition=dict(duration=400))
    fig.update_xaxes(showgrid=False, zeroline=False); fig.update_yaxes(gridcolor="rgba(120,115,190,.12)", zeroline=False)
    return fig

def _days(days): return [(engine.now() - timedelta(days=i)).date() for i in range(days - 1, -1, -1)]

def trend(state, days):
    ds = _days(days)
    created = Counter(engine.parse(i["created"]).date() for i in state["incidents"])
    res = Counter(engine.parse(i["resolved_at"]).date() for i in state["incidents"] if i.get("resolved_at"))
    f = go.Figure()
    f.add_scatter(x=ds, y=[created[d] for d in ds], name="Total", mode="lines+markers", line=dict(color=PAL[0], width=3, shape="spline"), fill="tozeroy", fillcolor="rgba(102,85,232,.10)")
    f.add_scatter(x=ds, y=[res[d] for d in ds], name="Resolved", mode="lines+markers", line=dict(color=PAL[3], width=2, shape="spline"))
    return _base(f)

def categories(incs):
    c = Counter(i["category"] for i in incs)
    f = go.Figure(go.Pie(labels=list(c), values=list(c.values()), hole=.65, marker=dict(colors=PAL), textinfo="percent", sort=False))
    f.add_annotation(text=f"<b>{len(incs)}</b><br>Total", showarrow=False, font=dict(size=18, color="#24234A"))
    return _base(f)

def systems(incs):
    c = Counter(i["service"] for i in incs).most_common(6)[::-1]
    f = go.Figure(go.Bar(x=[v for _, v in c], y=[k for k, _ in c], orientation="h", marker=dict(color=PAL[1], cornerradius=6)))
    f.update_xaxes(dtick=1)
    return _base(f)

def resolution_time(state, days):
    ds = _days(days); buckets = {d: [] for d in ds}
    for i in state["incidents"]:
        h = engine.hours_to_resolve(i)
        if h is not None and engine.parse(i["resolved_at"]).date() in buckets: buckets[engine.parse(i["resolved_at"]).date()].append(h)
    pts = [(d, sum(v) / len(v)) for d, v in buckets.items() if v]
    f = go.Figure(go.Scatter(x=[d for d, _ in pts], y=[round(v, 2) for _, v in pts], mode="lines+markers", line=dict(color=PAL[2], width=3, shape="spline"), fill="tozeroy", fillcolor="rgba(115,185,234,.15)"))
    f.update_yaxes(title="hours")
    return _base(f)
