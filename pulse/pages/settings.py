import json
import streamlit as st
from .. import components as C, store

TZ = ["(UTC+05:30) India Standard Time", "(UTC+00:00) UTC", "(UTC-05:00) Eastern Time", "(UTC-08:00) Pacific Time", "(UTC+01:00) Central European Time"]

def _save(state):
    s, ss = state["settings"], st.session_state
    for k in ("org", "tz", "view", "ai_suggestions", "auto_similar", "notify_owner", "demo_mode", "skip_anim", "email_digest", "slack_alerts", "user_name"):
        if f"set_{k}" in ss: s[k] = ss[f"set_{k}"]
    store.save(state); ss.saved_flag = True

def _reset(state):
    fresh = store.reset(); state.clear(); state.update(fresh)
    for k in ("sel", "last_new", "home_q", "rs_done", "rs_for"): st.session_state.pop(k, None)

def render(state, go):
    s = state["settings"]
    C.page_header("Settings", "Manage your preferences and system configuration.")
    t = st.tabs(["General", "Integrations", "Notifications", "Security", "Data & Privacy"])
    with t[0], st.container(key="panel_s1"):
        st.markdown("**General Settings**")
        st.text_input("Your name", value=s["user_name"], key="set_user_name")
        st.text_input("Organization Name", value=s["org"], key="set_org")
        st.selectbox("Time Zone", TZ, index=TZ.index(s["tz"]) if s["tz"] in TZ else 0, key="set_tz")
        st.selectbox("Default View", ["Home", "Memory", "Team", "Analytics"], index=["Home", "Memory", "Team", "Analytics"].index(s["view"]), key="set_view")
        st.toggle("Enable AI Suggestions", value=s["ai_suggestions"], key="set_ai_suggestions")
        st.toggle("Auto-detect Similar Incidents", value=s["auto_similar"], key="set_auto_similar")
        st.toggle("Notify Likely Owner", value=s["notify_owner"], key="set_notify_owner")
        st.toggle("Demo mode (animated guided analysis)", value=s["demo_mode"], key="set_demo_mode")
        st.toggle("Skip animation", value=s["skip_anim"], key="set_skip_anim")
        st.button("Save Changes", type="primary", on_click=_save, args=(state,), key="save_set")
        if st.session_state.pop("saved_flag", False): st.markdown('<div class="ok">✓ Settings saved</div>', unsafe_allow_html=True)
    with t[1], st.container(key="panel_s2"):
        st.markdown("**Integrations**"); st.caption("Slack, PagerDuty and Jira connectors are not included in this build. The toggle below is stored for when they are added.")
        st.toggle("Slack alerts", value=s["slack_alerts"], key="set_slack_alerts"); st.button("Save Changes", type="primary", on_click=_save, args=(state,), key="save_int")
    with t[2], st.container(key="panel_s3"):
        st.markdown("**Notifications**"); st.toggle("Email digest", value=s["email_digest"], key="set_email_digest")
        st.caption("Owner notifications are controlled in General."); st.button("Save Changes", type="primary", on_click=_save, args=(state,), key="save_not")
    with t[3], st.container(key="panel_s4"):
        st.markdown("**Security**"); st.info("Pulse stores data locally in data/pulse_state.json. There is no login in this build — put it behind your own auth or VPN before sharing it.")
    with t[4], st.container(key="panel_s5"):
        st.markdown("**Data & Privacy**")
        st.download_button("Export data (JSON)", json.dumps(state, indent=2), "pulse_state.json", "application/json")
        if st.checkbox("I understand this restores the sample data and deletes my changes"):
            st.button("Reset to sample data", on_click=_reset, args=(state,), key="reset")
