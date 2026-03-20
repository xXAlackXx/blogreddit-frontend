<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>BLOGREDDIT · Access Terminal</title>
  <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=JetBrains+Mono:wght@400;600;700&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --wall:   #ECEAE2;
      --paper:  #FDFCF8;
      --board:  #E8E4DC;
      --crack:  #C8C2B6;
      --ink:    #111008;
      --smudge: #3A3630;
      --dust:   #6A6258;
      --fade:   #9A9288;
      --acid:   #6DC800;
      --rust:   #E8420A;
      --amber:  #F0B800;
      --steel:  #1A6EC0;
      --teal:   #0A9E88;
    }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    html,body{height:100%;}
    body{
      font-family:'DM Sans',sans-serif;
      background:var(--ink);
      color:var(--ink);
      min-height:100vh;
      overflow:hidden;
    }
 
    /* GRAIN */
    body::after{
      content:'';position:fixed;inset:-50%;width:200%;height:200%;
      background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E");
      pointer-events:none;z-index:998;
      animation:grain 0.35s steps(1) infinite;
    }
    @keyframes grain{
      0%{transform:translate(0,0)}20%{transform:translate(-4%,3%)}
      40%{transform:translate(3%,-4%)}60%{transform:translate(-2%,2%)}
      80%{transform:translate(4%,-2%)}100%{transform:translate(-1%,3%)}
    }
 
    #cv{position:fixed;inset:0;pointer-events:none;z-index:1;}
 
    /* ===================== SPLIT PANELS ===================== */
    .panel-left{
      position:fixed;top:0;left:0;width:50%;height:100%;
      background:var(--ink);
      z-index:2;overflow:hidden;
    }
    .panel-right{
      position:fixed;top:0;right:0;width:50%;height:100%;
      background:var(--wall);
      z-index:2;
    }
 
    /* vertical acid divider line */
    .panel-divider{
      position:fixed;top:0;left:50%;width:4px;height:100%;
      background:var(--acid);
      z-index:12;
      transform:translateX(-50%);
      box-shadow:0 0 20px rgba(109,200,0,0.3);
    }
 
    /* ===================== LEFT PANEL WORDS ===================== */
    .left-words{
      position:absolute;inset:0;
      display:flex;flex-direction:column;justify-content:center;
      padding:52px 36px 80px 44px;
      gap:1px;
      overflow:hidden;
    }
    .lw{
      font-family:'Space Grotesk',sans-serif;font-weight:700;
      color:transparent;
      -webkit-text-stroke:1.5px var(--acid);
      line-height:1.06;letter-spacing:-0.04em;
      text-transform:uppercase;white-space:nowrap;
    }
    .lw-xs { font-size:clamp(16px,2.4vw,30px); }
    .lw-sm { font-size:clamp(20px,3.0vw,38px); }
    .lw-md { font-size:clamp(26px,3.8vw,48px); }
    .lw-lg { font-size:clamp(32px,4.6vw,58px); }
    .lw-xl { font-size:clamp(38px,5.4vw,68px); }
 
    /* one word fully filled solid — the standout */
    .lw.filled{
      color:var(--acid);
      -webkit-text-stroke:0;
    }
    /* rust-tinted word */
    .lw.rust-stroke{
      -webkit-text-stroke:1.5px var(--rust);
    }
    /* amber-tinted word */
    .lw.amber-stroke{
      -webkit-text-stroke:1.5px var(--amber);
    }
    /* slash separator */
    .lw .sl{
      color:var(--acid);
      -webkit-text-stroke:0;
      opacity:0.26;
      margin-left:4px;
      font-size:0.75em;
      vertical-align:middle;
    }
    .lw.filled .sl{ color:var(--ink); opacity:0.35; }
    .lw.rust-stroke .sl{ color:var(--rust); }
    .lw.amber-stroke .sl{ color:var(--amber); }
 
    /* corner accent marks */
    .left-corner-tr{
      position:absolute;top:26px;right:22px;
      width:22px;height:22px;
      border-top:2px solid var(--acid);border-right:2px solid var(--acid);
      opacity:0.35;
    }
    .left-corner-bl{
      position:absolute;bottom:58px;left:42px;
      width:16px;height:16px;
      border-bottom:2px solid var(--rust);border-left:2px solid var(--rust);
      opacity:0.28;
    }
 
    /* DECAY—84 stencil stamp */
    .left-tag{
      position:absolute;bottom:24px;left:44px;
      font-family:'JetBrains Mono',monospace;font-size:10px;font-weight:700;
      color:var(--amber);letter-spacing:0.26em;text-transform:uppercase;
      opacity:0.72;
    }
    .left-tag::before{ content:'// '; }
 
    /* small acid square dot — top-left */
    .left-dot{
      position:absolute;top:28px;left:44px;
      width:7px;height:7px;
      background:var(--acid);
      opacity:0.65;
    }
 
    /* ===================== RIGHT PANEL ===================== */
 
    /* ghost "84" watermark */
    .ghost-84{
      position:fixed;font-family:'Space Grotesk',sans-serif;font-weight:700;
      font-size:clamp(160px,20vw,310px);color:transparent;
      -webkit-text-stroke:2px rgba(17,16,8,0.045);
      bottom:-15px;right:-10px;letter-spacing:-0.06em;
      pointer-events:none;user-select:none;z-index:3;line-height:1;
    }
 
    /* halos — right panel only */
    .right-halos{
      position:fixed;top:0;right:0;width:50%;height:100%;
      pointer-events:none;z-index:3;overflow:hidden;
    }
 
    /* scratch lines — right panel */
    .bg-scratch{
      position:fixed;top:0;right:0;width:50%;height:100%;
      pointer-events:none;z-index:3;
      background:
        repeating-linear-gradient(87deg,transparent 0,transparent 42px,rgba(17,16,8,0.012) 43px,rgba(17,16,8,0.012) 44px),
        repeating-linear-gradient(3deg,transparent 0,transparent 88px,rgba(17,16,8,0.008) 89px,rgba(17,16,8,0.008) 90px);
    }
 
    /* ACCENT STRIPES */
    .stripe-top{position:fixed;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--acid),var(--teal),var(--steel),var(--rust));z-index:50;}
    .stripe-left{position:fixed;top:0;left:0;width:4px;height:100%;background:linear-gradient(180deg,var(--acid),var(--teal) 50%,var(--rust));z-index:50;}
 
    /* ===================== FLOATING CARDS ===================== */
    .f-card{
      position:fixed;border:2px solid var(--ink);box-shadow:5px 5px 0 var(--ink);
      overflow:hidden;z-index:5;pointer-events:none;
    }
    .fc-tag{
      font-family:'JetBrains Mono',monospace;font-size:9px;font-weight:700;
      text-transform:uppercase;letter-spacing:0.15em;
      padding:2px 7px;border:2px solid var(--ink);display:inline-block;margin-bottom:8px;
    }
    .fc-title{font-family:'Lora',serif;font-style:italic;font-weight:700;font-size:12px;line-height:1.35;color:var(--ink);margin-bottom:5px;}
    .fc-meta{font-family:'JetBrains Mono',monospace;font-size:9px;color:var(--fade);}
    .fc-votes{display:flex;align-items:center;gap:4px;margin-top:6px;}
    .fc-votes svg{width:11px;height:11px;color:var(--acid);}
    .fc-votes span{font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;color:var(--acid);}
 
    /* all cards inside right half */
    .fc-1{width:196px;background:var(--paper);padding:12px;top:6vh;left:52vw;
      animation:flyIn1 .7s cubic-bezier(.22,1,.36,1) .1s both,floatA 5s ease-in-out 1s infinite;}
    .fc-2{width:228px;top:4vh;right:3.5vw;
      animation:flyIn2 .7s cubic-bezier(.22,1,.36,1) .2s both,floatB 6s ease-in-out 1.2s infinite;}
    .fc-3{width:158px;bottom:20vh;left:51.5vw;
      animation:flyIn3 .7s cubic-bezier(.22,1,.36,1) .32s both,floatC 4.5s ease-in-out .8s infinite;}
    .fc-4{width:196px;background:var(--paper);padding:12px;bottom:8vh;right:3vw;
      animation:flyIn4 .7s cubic-bezier(.22,1,.36,1) .42s both,floatA 5.5s ease-in-out 2s infinite;}
    .fc-5{width:136px;height:168px;top:40vh;left:50.5vw;
      animation:flyIn3 .7s cubic-bezier(.22,1,.36,1) .5s both,floatB 7s ease-in-out 1.5s infinite;}
    .fc-6{width:118px;background:var(--paper);padding:10px;top:33vh;right:2.5vw;
      animation:flyIn2 .7s cubic-bezier(.22,1,.36,1) .6s both,floatC 5.8s ease-in-out 2.5s infinite;}
    .fc-7{width:148px;bottom:4vh;left:64vw;
      animation:flyIn4 .7s cubic-bezier(.22,1,.36,1) .7s both,floatA 6.5s ease-in-out 3s infinite;}
    .fc-8{width:138px;background:var(--paper);padding:10px;top:11vh;left:70vw;
      animation:flyIn1 .7s cubic-bezier(.22,1,.36,1) .15s both,floatB 5.2s ease-in-out .5s infinite;}
 
    @keyframes flyIn1{from{opacity:0;transform:translate(-70px,-45px) rotate(-7deg) scale(.82);}to{opacity:1;transform:translate(0,0) rotate(-2.5deg) scale(1);}}
    @keyframes flyIn2{from{opacity:0;transform:translate(80px,-35px) rotate(6deg) scale(.85);}to{opacity:1;transform:translate(0,0) rotate(2deg) scale(1);}}
    @keyframes flyIn3{from{opacity:0;transform:translate(-45px,65px) rotate(4deg) scale(.88);}to{opacity:1;transform:translate(0,0) rotate(1.5deg) scale(1);}}
    @keyframes flyIn4{from{opacity:0;transform:translate(55px,65px) rotate(-5deg) scale(.84);}to{opacity:1;transform:translate(0,0) rotate(-1.5deg) scale(1);}}
 
    @keyframes floatA{0%,100%{transform:rotate(-2.5deg) translateY(0);}50%{transform:rotate(-2.5deg) translateY(-10px);}}
    @keyframes floatB{0%,100%{transform:rotate(2deg) translateY(0);}50%{transform:rotate(2deg) translateY(-8px);}}
    @keyframes floatC{0%,100%{transform:rotate(1.5deg) translateY(0);}50%{transform:rotate(1.5deg) translateY(-12px);}}
 
    /* ===================== AUTH FORM ===================== */
    .auth-wrapper{
      /* centered over FULL viewport — bridges both panels */
      position:fixed;inset:0;
      display:flex;align-items:center;justify-content:center;
      z-index:20;pointer-events:none;
    }
    .auth-center{
      width:100%;max-width:520px;padding:0 20px;
      pointer-events:all;
      /* subtle drop shadow so it lifts off both panels */
      filter:drop-shadow(0 20px 48px rgba(17,16,8,0.32));
      animation:popIn .6s cubic-bezier(.22,1,.36,1) .08s both;
    }
    @keyframes popIn{from{opacity:0;transform:scale(.90) translateY(24px);}to{opacity:1;transform:scale(1) translateY(0);}}
 
    .login-logo{margin-bottom:28px;text-align:center;}
    .login-logo-mark{
      display:inline-block;background:var(--ink);color:var(--paper);
      font-family:'Space Grotesk',sans-serif;font-weight:700;font-size:34px;letter-spacing:-0.02em;
      padding:12px 28px;border:2px solid var(--ink);box-shadow:6px 6px 0 var(--acid);
      line-height:1;margin-bottom:12px;animation:glitch 9s ease-in-out 5s infinite;
    }
    .login-logo-mark .r{color:var(--acid);}
    .login-terminal{
      font-family:'JetBrains Mono',monospace;font-size:12px;font-weight:700;
      letter-spacing:0.38em;text-transform:uppercase;color:var(--fade);
      display:flex;align-items:center;justify-content:center;gap:8px;
    }
    .login-terminal::before{content:'//';color:var(--acid);font-weight:700;}
 
    .auth-tabs{
      display:flex;border:2px solid var(--ink);margin-bottom:0;box-shadow:5px 5px 0 var(--ink);
    }
    .auth-tab{
      flex:1;padding:15px;font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:700;
      text-transform:uppercase;letter-spacing:0.2em;
      border:none;cursor:pointer;transition:all .15s;border-right:2px solid var(--ink);
      position:relative;
    }
    .auth-tab:last-child{border-right:none;}
 
    /* LOGIN — blanco */
    #tab-login{ background:var(--paper); color:var(--fade); }
    #tab-login.active{ background:var(--paper); color:var(--ink); }
    #tab-login.active::after{
      content:'';position:absolute;bottom:0;left:0;right:0;height:3px;
      background:var(--acid);
    }
    #tab-login:not(.active):hover{ background:var(--board); color:var(--smudge); }
 
    /* REGISTER — negro */
    #tab-register{ background:var(--smudge); color:var(--fade); }
    #tab-register.active{ background:var(--ink); color:var(--acid); }
    #tab-register.active::after{
      content:'';position:absolute;bottom:0;left:0;right:0;height:3px;
      background:var(--rust);
    }
    #tab-register:not(.active):hover{ background:var(--ink); color:var(--paper); }
 
    .auth-card{
      background:var(--paper);
      border:2px solid var(--ink);border-top:none;
      box-shadow:8px 8px 0 var(--ink);
      padding:36px 36px 30px;position:relative;overflow:hidden;
    }
    .auth-card::before{
      content:'';position:absolute;top:0;left:0;right:0;height:5px;
      background:linear-gradient(90deg,var(--acid),var(--teal),var(--steel));
    }
 
    .form-pane{display:none;}
    .form-pane.active{display:block;}
 
    .form-field{margin-bottom:18px;}
    .form-field label{
      display:block;font-family:'JetBrains Mono',monospace;font-size:11px;font-weight:700;
      text-transform:uppercase;letter-spacing:0.22em;color:var(--smudge);margin-bottom:7px;
    }
    .form-field input{
      width:100%;background:var(--board);border:2px solid var(--crack);
      padding:15px 16px;font-family:'DM Sans',sans-serif;font-size:16px;color:var(--ink);
      outline:none;transition:border-color .15s,box-shadow .15s;
    }
    .form-field input:focus{
      border-color:var(--ink);box-shadow:3px 3px 0 var(--ink);background:var(--board);
    }
    .form-field input::placeholder{color:var(--fade);}
 
    .pass-wrap{position:relative;}
    .pass-wrap input{padding-right:42px;}
    .pass-toggle{
      position:absolute;right:12px;top:50%;transform:translateY(-50%);
      background:none;border:none;cursor:pointer;color:var(--fade);padding:0;transition:color .15s;
    }
    .pass-toggle:hover{color:var(--ink);}
    .pass-toggle svg{width:16px;height:16px;display:block;}
 
    .btn-submit-dark{
      width:100%;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;
      text-transform:uppercase;letter-spacing:0.14em;
      background:var(--ink);color:var(--acid);border:2px solid var(--ink);box-shadow:6px 6px 0 var(--acid);
      padding:17px;cursor:pointer;transition:all .15s;margin-top:8px;
    }
    .btn-submit-dark:hover{transform:translate(-2px,-2px);box-shadow:8px 8px 0 var(--acid);}
    .btn-submit-dark:active{transform:translate(2px,2px);box-shadow:0 0 0 var(--acid);}
 
    .btn-submit-acid{
      width:100%;font-family:'Space Grotesk',sans-serif;font-size:16px;font-weight:700;
      text-transform:uppercase;letter-spacing:0.14em;
      background:var(--acid);color:var(--ink);border:2px solid var(--ink);box-shadow:6px 6px 0 var(--ink);
      padding:17px;cursor:pointer;transition:all .15s;margin-top:8px;
    }
    .btn-submit-acid:hover{transform:translate(-2px,-2px);box-shadow:8px 8px 0 var(--ink);}
    .btn-submit-acid:active{transform:translate(2px,2px);box-shadow:0 0 0 var(--ink);}
 
    .forgot-link{
      display:block;text-align:right;font-family:'JetBrains Mono',monospace;font-size:11px;
      color:var(--steel);text-decoration:none;letter-spacing:0.08em;
      margin-top:-4px;margin-bottom:16px;transition:color .15s;
    }
    .forgot-link:hover{color:var(--rust);}
 
    .form-hint{
      font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--fade);
      text-align:center;margin-top:14px;letter-spacing:0.08em;
    }
    .form-hint a{color:var(--steel);text-decoration:none;font-weight:700;}
    .form-hint a:hover{color:var(--rust);}
 
    .field-error{
      display:none;font-family:'JetBrains Mono',monospace;font-size:10px;
      color:var(--rust);letter-spacing:0.05em;margin-top:4px;
    }
    .form-field.has-error input{border-color:var(--rust);box-shadow:3px 3px 0 var(--rust);}
    .form-field.has-error .field-error{display:block;}
 
    .anon-link{margin-top:14px;text-align:center;}
    .anon-link a{
      font-family:'JetBrains Mono',monospace;font-size:11px;color:var(--steel);
      text-decoration:none;letter-spacing:0.12em;text-transform:uppercase;
      display:inline-flex;align-items:center;gap:8px;transition:color .15s;
    }
    .anon-link a::before{content:'';display:inline-block;width:5px;height:5px;border:2px solid var(--steel);transition:border-color .15s;}
    .anon-link a:hover{color:var(--rust);}
    .anon-link a:hover::before{border-color:var(--rust);}
 
    .back-feed{
      position:fixed;bottom:20px;left:50%;transform:translateX(-50%);
      font-family:'JetBrains Mono',monospace;font-size:10px;color:var(--fade);
      text-decoration:none;letter-spacing:0.15em;text-transform:uppercase;
      display:flex;align-items:center;gap:6px;transition:color .15s;z-index:30;
      animation:fadeUp .5s cubic-bezier(.22,1,.36,1) .8s both;
    }
    .back-feed::before{content:'←';}
    .back-feed:hover{color:var(--ink);}
 
    @keyframes glitch{
      0%,90%,100%{transform:none;filter:none;}
      91%{transform:translateX(-2px);filter:brightness(1.2);}
      92%{transform:translateX(3px) skewX(-2deg);filter:hue-rotate(25deg);}
      93%{transform:none;filter:none;}94%{transform:translateX(-1px);}95%{transform:none;}
    }
    @keyframes fadeUp{
      from{opacity:0;transform:translate(-50%,12px);}
      to{opacity:1;transform:translate(-50%,0);}
    }
  </style>
</head>
<body>
<canvas id="cv"></canvas>
 
<!-- LEFT DARK PANEL -->
<div class="panel-left">
  <div class="left-words">
    <div class="lw lw-xl">HUSTLE<span class="sl">/</span></div>
    <div class="lw lw-sm">GRIND<span class="sl">/</span></div>
    <div class="lw lw-md">NO SLEEP<span class="sl">/</span></div>
    <div class="lw lw-lg">GUTTER<span class="sl">/</span></div>
    <div class="lw lw-xs">CONCRETE<span class="sl">/</span></div>
    <div class="lw lw-xl filled">REPRESENT<span class="sl">/</span></div>
    <div class="lw lw-md">CERTIFIED<span class="sl">/</span></div>
    <div class="lw lw-sm">STATIC<span class="sl">/</span></div>
    <div class="lw lw-lg">PRESSURE<span class="sl">/</span></div>
    <div class="lw lw-xs">LOCKED IN<span class="sl">/</span></div>
    <div class="lw lw-md rust-stroke">HEAT<span class="sl">/</span></div>
    <div class="lw lw-lg amber-stroke">SIGNAL<span class="sl">/</span></div>
  </div>
  <div class="left-dot"></div>
  <div class="left-corner-tr"></div>
  <div class="left-corner-bl"></div>
  <div class="left-tag">DECAY—84</div>
</div>
 
<!-- RIGHT LIGHT PANEL -->
<div class="panel-right"></div>
 
<!-- ACID DIVIDER -->
<div class="panel-divider"></div>
 
<!-- right-panel halos -->
<svg class="right-halos" viewBox="0 0 720 900" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
  <defs>
    <radialGradient id="bh1" cx="50%" cy="50%"><stop offset="0%" stop-color="#6DC800" stop-opacity="0.11"/><stop offset="100%" stop-color="#6DC800" stop-opacity="0"/></radialGradient>
    <radialGradient id="bh2" cx="50%" cy="50%"><stop offset="0%" stop-color="#E8420A" stop-opacity="0.09"/><stop offset="100%" stop-color="#E8420A" stop-opacity="0"/></radialGradient>
    <radialGradient id="bh3" cx="50%" cy="50%"><stop offset="0%" stop-color="#1A6EC0" stop-opacity="0.07"/><stop offset="100%" stop-color="#1A6EC0" stop-opacity="0"/></radialGradient>
  </defs>
  <ellipse cx="620" cy="820" rx="320" ry="250" fill="url(#bh2)"/>
  <ellipse cx="560" cy="110" rx="260" ry="200" fill="url(#bh3)"/>
  <ellipse cx="90"  cy="460" rx="190" ry="170" fill="url(#bh1)"/>
  <circle cx="660" cy="748" r="3" fill="#E8420A" opacity="0.16"/>
  <circle cx="672" cy="736" r="2" fill="#E8420A" opacity="0.11"/>
</svg>
 
<div class="bg-scratch"></div>
<div class="ghost-84">84</div>
<div class="stripe-top"></div>
<div class="stripe-left"></div>
 
<!-- FLOATING CARDS — all right half -->
<div class="f-card fc-1">
  <div style="height:3px;background:var(--acid)"></div>
  <div style="padding:11px 13px">
    <div class="fc-tag" style="background:var(--acid);color:var(--ink)">Django</div>
    <div class="fc-title">Por qué GraphQL cambia todo en proyectos medianos</div>
    <div class="fc-meta">maría.c · hace 4h</div>
    <div class="fc-votes">
      <svg fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/></svg>
      <span>342</span>
    </div>
  </div>
</div>
 
<div class="f-card fc-2" style="background:var(--ink)">
  <svg viewBox="0 0 228 138" xmlns="http://www.w3.org/2000/svg" style="display:block;width:228px">
    <rect width="228" height="138" fill="#111008"/>
    <defs>
      <radialGradient id="sg1" cx="30%" cy="40%"><stop offset="0%" stop-color="#6DC800" stop-opacity="0.26"/><stop offset="100%" stop-color="#6DC800" stop-opacity="0"/></radialGradient>
      <radialGradient id="sg2" cx="75%" cy="65%"><stop offset="0%" stop-color="#E8420A" stop-opacity="0.20"/><stop offset="100%" stop-color="#E8420A" stop-opacity="0"/></radialGradient>
    </defs>
    <ellipse cx="68" cy="56" rx="106" ry="78" fill="url(#sg1)"/>
    <ellipse cx="176" cy="93" rx="88" ry="63" fill="url(#sg2)"/>
    <text x="11" y="79" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="49" fill="none" stroke="#6DC800" stroke-width="1.5" opacity="0.9" letter-spacing="-3">DCY</text>
    <rect x="11" y="88" width="36" height="4" fill="#E8420A" opacity="0.9"/>
    <text x="140" y="123" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="44" fill="none" stroke="#F0B800" stroke-width="1" opacity="0.7" letter-spacing="-2">84</text>
    <rect x="0" y="0" width="228" height="5" fill="#6DC800" opacity="0.85"/>
    <path d="M176 24 L194 13 M185 13 L194 13 L194 24" stroke="#F0B800" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
  </svg>
</div>
 
<div class="f-card fc-3" style="background:var(--amber)">
  <svg viewBox="0 0 158 112" xmlns="http://www.w3.org/2000/svg" style="display:block;width:158px">
    <rect width="158" height="112" fill="#F0B800"/>
    <rect x="0" y="0" width="158" height="6" fill="#111008"/>
    <circle cx="79" cy="52" r="28" fill="none" stroke="#111008" stroke-width="3" opacity="0.7"/>
    <circle cx="69" cy="47" r="6" fill="#111008" opacity="0.6"/>
    <circle cx="91" cy="47" r="6" fill="#111008" opacity="0.6"/>
    <path d="M65 67 Q79 80 93 67" stroke="#111008" stroke-width="3" fill="none" opacity="0.6" stroke-linecap="round"/>
    <text x="79" y="103" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="9" fill="#111008" text-anchor="middle" letter-spacing="3" opacity="0.7">STAY RAW</text>
  </svg>
</div>
 
<div class="f-card fc-4">
  <div style="height:3px;background:var(--steel)"></div>
  <div style="padding:11px 13px">
    <div class="fc-tag" style="background:var(--steel);color:white">Tutorial</div>
    <div class="fc-title">JWT Auth con DRF paso a paso</div>
    <div class="fc-meta">josé.p · hace 2d</div>
    <div class="fc-votes">
      <svg fill="currentColor" viewBox="0 0 20 20" style="color:var(--acid)"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/></svg>
      <span>98</span>
    </div>
  </div>
</div>
 
<div class="f-card fc-5" style="background:var(--paper)">
  <svg viewBox="0 0 136 168" xmlns="http://www.w3.org/2000/svg" style="display:block;width:136px;height:168px">
    <rect width="136" height="168" fill="#FDFCF8"/>
    <rect x="0" y="0" width="5" height="168" fill="#E8420A"/>
    <text x="76" y="52" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="34" fill="none" stroke="#111008" stroke-width="1.5" text-anchor="middle" opacity="0.8">S</text>
    <text x="76" y="94" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="34" fill="none" stroke="#6DC800" stroke-width="1.5" text-anchor="middle" opacity="0.8">T</text>
    <text x="76" y="136" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="34" fill="none" stroke="#E8420A" stroke-width="1.5" text-anchor="middle" opacity="0.8">R</text>
    <path d="M68 154 Q66 162 68 167" stroke="#111008" stroke-width="2" fill="none" opacity="0.3"/>
  </svg>
</div>
 
<div class="f-card fc-6" style="padding:10px">
  <div style="height:3px;background:var(--rust);margin:-10px -10px 9px -10px"></div>
  <div class="fc-tag" style="background:var(--rust);color:white">Debate</div>
  <div class="fc-title">¿Tailwind mata el CSS?</div>
  <div class="fc-votes">
    <svg fill="currentColor" viewBox="0 0 20 20" style="color:var(--acid)"><path fill-rule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"/></svg>
    <span>112</span>
  </div>
</div>
 
<div class="f-card fc-7" style="background:var(--teal)">
  <svg viewBox="0 0 148 80" xmlns="http://www.w3.org/2000/svg" style="display:block;width:148px">
    <rect width="148" height="80" fill="#0A9E88"/>
    <rect x="0" y="0" width="148" height="5" fill="#111008"/>
    <text x="74" y="45" font-family="Space Grotesk,sans-serif" font-weight="700" font-size="24" fill="none" stroke="#FDFCF8" stroke-width="1.5" text-anchor="middle" opacity="0.85" letter-spacing="-1">WRITE</text>
    <text x="74" y="68" font-family="JetBrains Mono,monospace" font-weight="700" font-size="8" fill="#FDFCF8" text-anchor="middle" letter-spacing="4" opacity="0.6">YOUR STORY</text>
  </svg>
</div>
 
<div class="f-card fc-8">
  <div style="height:3px;background:var(--amber)"></div>
  <div style="padding:9px 11px">
    <div class="fc-tag" style="background:var(--amber);color:var(--ink)">React</div>
    <div class="fc-title">Server Components y el TTFB bajó 60%</div>
    <div class="fc-meta">andrés.l · 6h</div>
  </div>
</div>
 
<!-- AUTH FORM — centered in right panel -->
<div class="auth-wrapper">
  <div class="auth-center">
    <div class="login-logo">
      <div class="login-logo-mark">BLOG<span class="r">R</span>EDDIT</div>
      <div class="login-terminal">ACCESS TERMINAL</div>
    </div>
    <div class="auth-tabs">
      <button class="auth-tab active" id="tab-login" onclick="switchTab('login')">Login</button>
      <button class="auth-tab" id="tab-register" onclick="switchTab('register')">Register</button>
    </div>
    <div class="auth-card">
 
      <!-- LOGIN -->
      <div class="form-pane active" id="pane-login">
        <form onsubmit="return handleLogin(event)">
          <div class="form-field" id="field-user">
            <label>Username</label>
            <input type="text" id="input-user" placeholder="your_handle" autocomplete="username">
            <div class="field-error" id="err-user">Campo requerido</div>
          </div>
          <div class="form-field" id="field-pass">
            <label>Password</label>
            <div class="pass-wrap">
              <input type="password" id="input-pass" placeholder="••••••••" autocomplete="current-password">
              <button type="button" class="pass-toggle" onclick="togglePass('input-pass',this)">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
            <div class="field-error" id="err-pass">Campo requerido</div>
          </div>
          <a href="#" class="forgot-link">¿Olvidaste tu contraseña?</a>
          <button type="submit" class="btn-submit-dark">ACCESS →</button>
        </form>
        <div class="form-hint">no account? <a href="#" onclick="switchTab('register');return false;">REGISTER</a></div>
      </div>
 
      <!-- REGISTER -->
      <div class="form-pane" id="pane-register">
        <form onsubmit="return handleRegister(event)">
          <div class="form-field" id="field-reguser">
            <label>Username</label>
            <input type="text" id="input-reguser" placeholder="your_handle" autocomplete="username">
            <div class="field-error" id="err-reguser">Mínimo 3 caracteres</div>
          </div>
          <div class="form-field" id="field-regemail">
            <label>Email</label>
            <input type="email" id="input-regemail" placeholder="tu@email.com" autocomplete="email">
            <div class="field-error" id="err-regemail">Email inválido</div>
          </div>
          <div class="form-field" id="field-regpass">
            <label>Password</label>
            <div class="pass-wrap">
              <input type="password" id="input-regpass" placeholder="mín. 8 caracteres" autocomplete="new-password">
              <button type="button" class="pass-toggle" onclick="togglePass('input-regpass',this)">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
              </button>
            </div>
            <div class="field-error" id="err-regpass">Mínimo 8 caracteres</div>
          </div>
          <button type="submit" class="btn-submit-acid">JOIN THE WALL →</button>
        </form>
        <div class="form-hint">already in? <a href="#" onclick="switchTab('login');return false;">LOGIN</a></div>
      </div>
 
    </div>
    <div class="anon-link">
      <a href="/">Continuar sin cuenta — solo lectura</a>
    </div>
  </div>
</div>
 
<a href="/" class="back-feed">Volver al feed</a>
 
<script>
  /* PARTICLES — right panel only */
  (function(){
    const cv=document.getElementById('cv'),ctx=cv.getContext('2d');
    let W,H,pts=[];
    const colors=['#6DC800','#E8420A','#F0B800','#1A6EC0','#0A9E88'];
    let mx=9999,my=9999;
    function resize(){W=cv.width=window.innerWidth;H=cv.height=window.innerHeight;}
    function init(){
      pts=[];
      const half=W/2;
      for(let i=0;i<40;i++)pts.push({
        x:half+Math.random()*(W-half),y:Math.random()*H,
        vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,
        r:Math.random()*1.8+.5,
        c:colors[Math.floor(Math.random()*colors.length)],
        a:Math.random()*.18+.04
      });
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      const half=W/2;
      pts.forEach(p=>{
        const dx=p.x-mx,dy=p.y-my,d=Math.sqrt(dx*dx+dy*dy);
        if(d<110&&d>0){const f=((110-d)/110)*.7;p.vx+=dx/d*f;p.vy+=dy/d*f;}
        p.vx*=.97;p.vy*=.97;p.x+=p.vx;p.y+=p.vy;
        if(p.x<half)p.x=W;if(p.x>W)p.x=half;
        if(p.y<0)p.y=H;if(p.y>H)p.y=0;
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=p.c;ctx.globalAlpha=p.a;ctx.fill();ctx.globalAlpha=1;
      });
      requestAnimationFrame(draw);
    }
    window.addEventListener('resize',()=>{resize();init();});
    document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;});
    resize();init();draw();
  })();
 
  /* PARALLAX CARDS */
  (function(){
    const cards=[
      {el:document.querySelector('.fc-1'),dx:0.016,dy:0.010,rot:-2.5},
      {el:document.querySelector('.fc-2'),dx:-0.020,dy:0.014,rot:2},
      {el:document.querySelector('.fc-3'),dx:0.012,dy:-0.018,rot:1.5},
      {el:document.querySelector('.fc-4'),dx:-0.018,dy:-0.012,rot:-1.5},
      {el:document.querySelector('.fc-5'),dx:0.024,dy:0.016,rot:1.5},
      {el:document.querySelector('.fc-6'),dx:-0.014,dy:0.020,rot:2},
      {el:document.querySelector('.fc-7'),dx:0.010,dy:-0.016,rot:-1.5},
      {el:document.querySelector('.fc-8'),dx:-0.018,dy:0.010,rot:-2.5},
    ];
    let tx=0,ty=0,cx=0,cy=0;
    document.addEventListener('mousemove',e=>{tx=e.clientX-window.innerWidth/2;ty=e.clientY-window.innerHeight/2;});
    function tick(){
      cx+=(tx-cx)*.055;cy+=(ty-cy)*.055;
      cards.forEach(c=>{if(c.el)c.el.style.transform=`rotate(${c.rot}deg) translate(${cx*c.dx}px,${cy*c.dy}px)`;});
      requestAnimationFrame(tick);
    }
    setTimeout(()=>tick(),800);
  })();
 
  /* TABS */
  function switchTab(tab){
    document.querySelectorAll('.auth-tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.form-pane').forEach(p=>p.classList.remove('active'));
    document.getElementById('tab-'+tab).classList.add('active');
    document.getElementById('pane-'+tab).classList.add('active');
  }
 
  /* PASS TOGGLE */
  function togglePass(id,btn){
    const inp=document.getElementById(id);
    inp.type=inp.type==='password'?'text':'password';
    btn.querySelector('svg').style.opacity=inp.type==='text'?'0.4':'1';
  }
 
  /* VALIDATION */
  function setError(fid,eid,show){
    document.getElementById(fid).classList.toggle('has-error',show);
    document.getElementById(eid).style.display=show?'block':'none';
  }
  function handleLogin(e){
    e.preventDefault();
    const u=document.getElementById('input-user').value.trim();
    const p=document.getElementById('input-pass').value;
    setError('field-user','err-user',!u);
    setError('field-pass','err-pass',!p);
    if(!u||!p)return false;
    return false;
  }
  function handleRegister(e){
    e.preventDefault();
    const u=document.getElementById('input-reguser').value.trim();
    const em=document.getElementById('input-regemail').value.trim();
    const p=document.getElementById('input-regpass').value;
    const emailOk=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    setError('field-reguser','err-reguser',u.length<3);
    setError('field-regemail','err-regemail',!emailOk);
    setError('field-regpass','err-regpass',p.length<8);
    if(u.length<3||!emailOk||p.length<8)return false;
    return false;
  }
</script>
</body>
</html>