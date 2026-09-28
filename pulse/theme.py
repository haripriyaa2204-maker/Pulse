"""Global CSS: lavender glass SaaS look."""
import streamlit as st

CSS = """
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@600;700&display=swap');
:root{--bg1:#F4F3FF;--bg2:#EEF0FF;--bg3:#E9E7FB;--p:#6655E8;--p2:#735CEB;--sp:#8E86F5;--sp2:#A9A4F7;--blue:#73B9EA;
--ok:#55CFA5;--warn:#F4B86A;--bad:#EA7897;--tx:#24234A;--tx2:#77759A;--card:rgba(255,255,255,.75);--bd:rgba(120,115,190,.16);
--sh:0 8px 28px rgba(102,85,232,.08)}
html,body,[class*="css"],.stApp{font-family:'Inter',system-ui,sans-serif;color:var(--tx)}
.stApp{background:linear-gradient(135deg,var(--bg1) 0%,var(--bg2) 55%,var(--bg3) 100%)}
#MainMenu,footer,[data-testid="stToolbar"],[data-testid="stDecoration"],[data-testid="stStatusWidget"]{display:none!important}
header[data-testid="stHeader"]{background:transparent}
.block-container{padding:1.2rem 2rem 3rem;max-width:1280px}
h1,h2,h3{font-family:'Poppins','Inter',sans-serif;color:var(--tx);letter-spacing:-.01em}
/* sidebar */
section[data-testid="stSidebar"]{background:linear-gradient(180deg,#F0EFFB,#E8E8F8);border-right:1px solid var(--bd);width:250px!important}
section[data-testid="stSidebar"] .block-container,[data-testid="stSidebarContent"]{padding-top:1rem}
.logo{display:flex;align-items:center;gap:10px;font:700 22px 'Poppins';color:var(--tx);margin:4px 6px 18px}
.logo i{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,var(--p),var(--sp));display:grid;place-items:center;color:#fff;font-style:normal;font-size:16px}
[class*="st-key-nav"] button{justify-content:flex-start;background:transparent;border:0;box-shadow:none;color:var(--tx2);font-weight:500;border-radius:14px;padding:.55rem .9rem;width:100%}
[class*="st-key-nav"] button:hover{background:rgba(142,134,245,.14);color:var(--p)}
[class*="st-key-navon-"] button{background:linear-gradient(135deg,rgba(102,85,232,.18),rgba(142,134,245,.16));color:var(--p);font-weight:600}
.side-card{margin-top:22px;padding:16px;border-radius:20px;background:linear-gradient(160deg,rgba(255,255,255,.7),rgba(169,164,247,.28));border:1px solid var(--bd);font:700 17px/1.25 'Poppins';color:var(--p)}
.side-card small{display:block;font:500 11px 'Inter';color:var(--tx2);margin-top:8px}
.prof{display:flex;align-items:center;gap:10px;margin-top:16px;padding:10px;border-radius:16px;background:var(--card);border:1px solid var(--bd)}
.prof b{font-size:13px;display:block}.prof span{font-size:11px;color:var(--tx2)}
.av{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,var(--sp),var(--blue));color:#fff;display:grid;place-items:center;font:600 13px 'Inter';flex:none}
.av.lg{width:56px;height:56px;font-size:19px}
/* cards */
[class*="st-key-panel"],[class*="st-key-card_"],.pcard{background:var(--card);border:1px solid var(--bd);border-radius:22px;box-shadow:var(--sh);backdrop-filter:blur(14px);padding:18px 20px}
[class*="st-key-panel"] [data-testid="stVerticalBlock"],[class*="st-key-card_"] [data-testid="stVerticalBlock"]{gap:.4rem}
[class*="st-key-card_"]{position:relative;transition:transform .18s ease,box-shadow .18s ease;animation:rise .35s ease both;margin-bottom:.4rem}
[class*="st-key-card_"]:hover{transform:translateY(-3px);box-shadow:0 14px 34px rgba(102,85,232,.16);border-color:rgba(102,85,232,.35)}
[class*="st-key-card_"] [data-testid="stElementContainer"]:has(button){position:absolute;inset:0;z-index:5;margin:0}
[class*="st-key-card_"] [data-testid="stElementContainer"]:has(button) div{height:100%;width:100%}
[class*="st-key-card_"] button{position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.st-key-hero{background:linear-gradient(135deg,rgba(255,255,255,.8),rgba(220,218,255,.55));border:1px solid var(--bd);border-radius:26px;box-shadow:var(--sh);padding:26px 30px;overflow:hidden}
.hero-t{font:700 30px/1.2 'Poppins';margin:0}.hero-s{color:var(--tx2);font-size:14px;margin:8px 0 14px}
.pg-t{font:700 28px 'Poppins';margin:0}.pg-s{color:var(--tx2);font-size:14px;margin:4px 0 16px}
.sec{font:600 17px 'Poppins';margin:22px 0 10px;color:var(--tx)}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:18px 0 4px}
.stat{background:var(--card);border:1px solid var(--bd);border-radius:20px;padding:16px;box-shadow:var(--sh);animation:rise .4s ease both}
.ico{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;font-size:16px;background:rgba(142,134,245,.16);color:var(--p)}
.stat .n{font:700 30px 'Poppins';margin-top:10px}.stat .l{font-size:12.5px;color:var(--tx2)}
.tr{font-size:11.5px;margin-top:4px;font-weight:500}.up{color:#2fae83}.dn{color:var(--bad)}
/* badges */
.b{display:inline-flex;align-items:center;gap:5px;padding:3px 11px;border-radius:99px;font:600 11.5px 'Inter';white-space:nowrap}
.b::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.b.Investigating{background:rgba(234,120,151,.15);color:#D9557C}.b.In-Progress{background:rgba(244,184,106,.2);color:#C98424}
.b.Resolved,.b.Active{background:rgba(85,207,165,.18);color:#25946F}.b.Monitoring{background:rgba(115,185,234,.2);color:#3A8BC4}
.b.On-Leave{background:rgba(234,120,151,.15);color:#D9557C}
.tag{display:inline-block;padding:2px 10px;margin:4px 6px 0 0;border-radius:99px;background:rgba(142,134,245,.14);color:var(--p);font-size:11px;font-weight:500;border:1px solid rgba(142,134,245,.2)}
.row{display:flex;align-items:center;gap:14px}.row .grow{flex:1;min-width:0}
.iid{font:600 12.5px 'Inter';color:var(--p)}.ttl{font-weight:600;font-size:14.5px;margin:2px 0}.sub{font-size:12px;color:var(--tx2)}
.sq{width:42px;height:42px;border-radius:13px;background:rgba(142,134,245,.16);display:grid;place-items:center;color:var(--p);font-size:18px;flex:none}
.sim{font:600 12px 'Inter';color:var(--p);background:rgba(102,85,232,.1);padding:2px 9px;border-radius:99px}
.kv{display:flex;gap:12px;padding:9px 0;border-bottom:1px solid var(--bd)}.kv:last-child{border:0}
.kv small{display:block;color:var(--tx2);font-size:11.5px}.kv b{font-size:13.5px;font-weight:600}
/* workflow */
.flow{display:flex;flex-wrap:wrap;gap:6px;align-items:center;padding:14px 16px;background:var(--card);border:1px solid var(--bd);border-radius:20px}
.flow span{padding:6px 12px;border-radius:99px;font-size:12px;font-weight:600;background:rgba(142,134,245,.14);color:var(--p)}
.flow span.hl{background:linear-gradient(135deg,var(--p),var(--sp));color:#fff}.flow em{color:var(--sp2);font-style:normal}
/* ring */
.ring{--v:87;width:76px;height:76px;border-radius:50%;background:conic-gradient(var(--p) calc(var(--v)*1%),rgba(142,134,245,.18) 0);display:grid;place-items:center;animation:rise .6s ease both}
.ring b{width:58px;height:58px;border-radius:50%;background:#fff;display:grid;place-items:center;font:700 15px 'Poppins';color:var(--p)}
.ok{padding:12px 16px;border-radius:14px;background:rgba(85,207,165,.16);color:#1E8A66;font-weight:600;animation:rise .3s ease both}
.stage{display:flex;align-items:center;gap:10px;padding:7px 0;font-size:13.5px}.stage .d{width:20px;height:20px;border-radius:50%;display:grid;place-items:center;font-size:11px;background:rgba(85,207,165,.2);color:#25946F}
.succ{text-align:center;padding:34px 10px}.succ .tick{width:84px;height:84px;margin:0 auto 14px;border-radius:50%;background:linear-gradient(135deg,var(--ok),#7fe0bd);display:grid;place-items:center;color:#fff;font-size:40px;box-shadow:0 0 0 12px rgba(85,207,165,.15);animation:pop .5s ease both}
@keyframes pop{from{transform:scale(.4);opacity:0}to{transform:scale(1);opacity:1}}
/* widgets */
.stButton>button,.stFormSubmitButton>button,.stDownloadButton>button{border-radius:14px;border:1px solid var(--bd);background:rgba(255,255,255,.85);color:var(--tx);font-weight:600;transition:all .15s ease}
.stButton>button:hover,.stFormSubmitButton>button:hover{border-color:var(--sp);color:var(--p);transform:translateY(-1px)}
button[kind="primary"],button[kind="primaryFormSubmit"]{background:linear-gradient(135deg,var(--p),var(--sp))!important;color:#fff!important;border:0!important;box-shadow:0 8px 20px rgba(102,85,232,.28)}
button[kind="primary"]:hover,button[kind="primaryFormSubmit"]:hover{color:#fff!important;filter:brightness(1.06)}
[data-baseweb="input"],[data-baseweb="select"]>div,[data-baseweb="textarea"],.stTextInput input{border-radius:16px!important;background:rgba(255,255,255,.85)!important;border-color:var(--bd)!important}
.stTextInput input{padding:.7rem 1rem}
button[data-baseweb="tab"]{font-weight:600;color:var(--tx2)}button[data-baseweb="tab"][aria-selected="true"]{color:var(--p)}
div[data-baseweb="tab-highlight"]{background:var(--p)}
[data-testid="stExpander"],[data-testid="stForm"]{border-radius:20px;border:1px solid var(--bd);background:var(--card)}
[data-testid="stSegmentedControl"] button{border-radius:99px!important}
.stProgress>div>div>div>div{background:linear-gradient(90deg,var(--p),var(--blue))}
/* responsive */
@media(max-width:1000px){.stats{grid-template-columns:repeat(2,1fr)}.block-container{padding:1rem 1rem 3rem}}
@media(max-width:640px){.hero-t{font-size:22px}.pg-t{font-size:22px}.stat .n{font-size:24px}.row{flex-wrap:wrap}
 [class*="st-key-panel"],[class*="st-key-card_"]{padding:14px}.st-key-hero{padding:18px}}
html,body{overflow-x:hidden}
</style>
"""

def inject():
    st.markdown(CSS, unsafe_allow_html=True)
