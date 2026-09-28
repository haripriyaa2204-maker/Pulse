"""Reusable HTML/Streamlit building blocks."""
import html
import streamlit as st
from . import engine

def e(x): return html.escape(str(x))
def badge(s): return f'<span class="b {e(s).replace(" ", "-")}">{e(s)}</span>'
def tags(ts): return "".join(f'<span class="tag">{e(t)}</span>' for t in ts)
def initials(n): return "".join(p[0] for p in n.split()[:2]).upper()
def avatar(n, big=False): return f'<div class="av{" lg" if big else ""}">{e(initials(n))}</div>'
def page_header(t, s): st.markdown(f'<div class="pg-t">{e(t)}</div><div class="pg-s">{e(s)}</div>', unsafe_allow_html=True)
def section(t): st.markdown(f'<div class="sec">{e(t)}</div>', unsafe_allow_html=True)

def stat_cards(items):
    """items: (icon, value, label, trend_text, up)"""
    out = "".join(f'<div class="stat"><div class="ico">{i}</div><div class="n">{e(v)}</div><div class="l">{e(l)}</div>'
                  f'<div class="tr {"up" if up else "dn"}">{"↑" if up else "↓"} {e(t)}</div></div>' for i, v, l, t, up in items)
    st.markdown(f'<div class="stats">{out}</div>', unsafe_allow_html=True)

def clickable(key, html_body, callback, *args):
    """A glass card that is fully clickable (invisible button overlay)."""
    with st.container(key=f"card_{key}"):
        st.markdown(html_body, unsafe_allow_html=True)
        st.button("open", key=f"btn_{key}", on_click=callback, args=args)

def incident_card(inc):
    return (f'<div class="iid">{e(inc["id"])}</div><div class="ttl">{e(inc["title"])}</div>'
            f'<div style="margin:8px 0">{badge(inc["status"])}</div><div class="sub">{engine.ago(inc["created"])}</div>')

def incident_row(inc, sim=None):
    s = f'<span class="sim">{int(sim * 100)}% match</span>' if sim else ""
    return (f'<div class="row"><div class="sq">▣</div><div class="grow"><div class="iid">{e(inc["id"])} {s}</div>'
            f'<div class="ttl">{e(inc["title"])}</div><div>{tags([inc["service"]] + inc["tags"][:2])}</div></div>'
            f'<div style="text-align:right">{badge(inc["status"])}<div class="sub" style="margin-top:6px">{engine.ago(inc["created"])} ›</div></div></div>')

def ring(v): return f'<div class="ring" style="--v:{v}"><b>{v}%</b></div>'

def workflow(highlight=None):
    steps = ["Problem", "Memory Search", "Similar Incident", "Previous Resolution", "Likely Owner", "Notify", "Resolve", "Teach Memory"]
    parts = "<em>→</em>".join(f'<span class="{"hl" if s == highlight else ""}">{s}</span>' for s in steps)
    st.markdown(f'<div class="flow">{parts}</div>', unsafe_allow_html=True)

def owner_line(o):
    if not o: return ""
    return f'Based on {e(", ".join(o["reasons"]))}.'
