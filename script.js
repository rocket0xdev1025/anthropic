/* ===== $ANT CONFIG: edit these at launch ===== */
const CONFIG = {
  CA: "0x65cB02a938233B85b8232c10dB926BA3F8E95B95",     // token contract address, 0x + 40 hex
  PAIR: "0x65cB02a938233B85b8232c10dB926BA3F8E95B95",   // DexScreener pair address (optional; falls back to CA)
  X: "https://x.com/anthropichood",
};
/* ============================================= */
(() => {
  "use strict";
  const ADDR = /^0x[a-fA-F0-9]{40}$/;
  const caLive = ADDR.test(CONFIG.CA);
  const pairId = ADDR.test(CONFIG.PAIR) ? CONFIG.PAIR : (caLive ? CONFIG.CA : "0x65cB02a938233B85b8232c10dB926BA3F8E95B95");
  const LINKS = {
    buy: `https://app.uniswap.org/swap?chain=robinhood&outputCurrency=${caLive ? CONFIG.CA : "0x65cB02a938233B85b8232c10dB926BA3F8E95B95"}`,
    chart: `https://dexscreener.com/robinhood/${pairId}`,
    embed: `https://dexscreener.com/robinhood/${pairId}?embed=1&theme=dark&trades=0&info=0`,
    x: CONFIG.X, tg: CONFIG.TG,
  };
  document.querySelectorAll("[data-link]").forEach(a => { const u = LINKS[a.dataset.link]; if (u) a.href = u; });
  document.querySelectorAll("[data-ca]").forEach(el => { el.textContent = caLive ? CONFIG.CA : "0x65cB02a938233B85b8232c10dB926BA3F8E95B95"; el.title = caLive ? CONFIG.CA : "Contract address coming at launch"; });

  // chart embed: only load + reveal once a real CA/pair exists
  const frame = document.getElementById("dexEmbed"), overlay = document.getElementById("chartOverlay");
  if (frame && pairId !== "0x65cB02a938233B85b8232c10dB926BA3F8E95B95") { frame.src = LINKS.embed; overlay && overlay.classList.add("hidden"); }

  // toast + copy
  const toast = document.getElementById("toast"); let tt;
  const say = m => { toast.textContent = m; toast.classList.add("show"); clearTimeout(tt); tt = setTimeout(() => toast.classList.remove("show"), 2200); };
  const fallbackCopy = t => { const ta = document.createElement("textarea"); ta.value = t; ta.setAttribute("readonly", ""); ta.style.cssText = "position:fixed;opacity:0;left:-9999px"; document.body.appendChild(ta); ta.select(); let ok = false; try { ok = document.execCommand("copy"); } catch (e) {} ta.remove(); return ok; };
  document.querySelectorAll(".copy-ca").forEach(btn => btn.addEventListener("click", async () => {
    const text = caLive ? CONFIG.CA : "0x65cB02a938233B85b8232c10dB926BA3F8E95B95";
    let ok = false;
    try { if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(text); ok = true; } } catch (e) {}
    if (!ok) ok = fallbackCopy(text);
    const lbl = btn.querySelector(".lbl"), old = lbl ? lbl.textContent : "";
    btn.classList.add("copied"); if (lbl) lbl.textContent = "Copied";
    setTimeout(() => { btn.classList.remove("copied"); if (lbl) lbl.textContent = old; }, 1600);
    say(!caLive ? "CA is 0x65cB02a938233B85b8232c10dB926BA3F8E95B95: launching soon. Hold the line." : ok ? "Contract address copied. Colony +1" : "Copy failed: select the address manually");
  }));

  // nav highlight via IntersectionObserver
  const navLinks = [...document.querySelectorAll(".links a")];
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) navLinks.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  }), { rootMargin: "-45% 0px -50% 0px" });
  navLinks.forEach(a => { const s = document.querySelector(a.getAttribute("href")); s && io.observe(s); });

  // scroll progress (native, works without GSAP)
  const bar = document.getElementById("progressBar");
  const prog = () => { const h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`; };
  addEventListener("scroll", prog, { passive: true }); prog();

  // winding tunnel path through the chambers
  const tunnel = document.getElementById("tunnel"), ug = document.querySelector(".underground");
  function buildTunnel() {
    const w = ug.clientWidth, h = ug.scrollHeight; tunnel.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const mob = w < 820, xs = mob ? [w * .93, w * .07] : [w * .06, w * .94];
    const secs = [...ug.querySelectorAll(":scope > section")];
    let d = `M ${w / 2} 0`, py = 0, px = w / 2;
    secs.forEach((s, i) => { const y = s.offsetTop + s.offsetHeight * .5, x = xs[i % 2]; const my = (py + y) / 2; d += ` C ${px} ${my}, ${x} ${my}, ${x} ${y}`; py = y; px = x; });
    d += ` C ${px} ${(py + h) / 2}, ${w / 2} ${(py + h) / 2}, ${w / 2} ${h}`;
    tunnel.querySelectorAll("path").forEach(p => p.setAttribute("d", d));
    return tunnel.querySelector(".tunnel-line");
  }
  let tline = buildTunnel();

  // gauge/runner setup
  const runPath = document.getElementById("runPath"), runners = document.getElementById("runners");
  const N = 7, NS = "http://www.w3.org/2000/svg", rs = [];
  for (let i = 0; i < N; i++) {
    const g = document.createElementNS(NS, "g"); g.setAttribute("class", "runner");
    g.innerHTML = '<ellipse class="body" cx="0" cy="4" rx="5" ry="4"/><ellipse class="body" cx="0" cy="-4" rx="4" ry="3.5"/><circle class="body" cx="0" cy="-10" r="3.5"/><path class="crumb" d="M-5 -19l5-4 6 2 1 5-6 3-6-2z"/>';
    runners.appendChild(g); rs.push(g);
  }
  const L = runPath.getTotalLength();
  const fill = document.getElementById("gaugeFill"), pct = document.getElementById("gaugePct"), state = document.getElementById("gaugeState");
  function setRun(p) {
    rs.forEach((g, i) => { const t = Math.min(1, Math.max(0, p * 1.4 - i * .06)); const len = L * (1 - t * .97); const a = runPath.getPointAtLength(len), b = runPath.getPointAtLength(Math.max(0, len - 2)); const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90; g.setAttribute("transform", `translate(${a.x} ${a.y}) rotate(${ang})`); g.style.opacity = t >= 1 ? 0 : 1; });
    const v = Math.round(p * 100); fill.style.transform = `scaleX(${p})`; pct.textContent = v + "%";
    state.textContent = v >= 100 ? "COLONY STRONG" : v > 66 ? "HOLDING THE LINE..." : v > 33 ? "WORKING TOGETHER..." : "DIGGING...";
    state.classList.toggle("win", v >= 100);
  }

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const coarse = matchMedia("(pointer: coarse), (max-width: 820px)").matches;
  const hasGSAP = window.gsap && window.ScrollTrigger;

  if (!hasGSAP || reduce) {               // static fallback
    setRun(1); tline.classList.add("solid");
    addEventListener("resize", () => { tline = buildTunnel(); tline.classList.add("solid"); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add("anim");
  setRun(0);

  // Lenis smooth scroll (desktop only)
  if (window.Lenis && !coarse) {
    try {
      const lenis = new Lenis({ lerp: .1 }); document.documentElement.classList.add("lenis");
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(t => lenis.raf(t * 1000)); gsap.ticker.lagSmoothing(0);
      document.querySelectorAll('a[href^="#"]').forEach(a => a.addEventListener("click", e => { const t = document.querySelector(a.getAttribute("href")); if (t) { e.preventDefault(); lenis.scrollTo(t, { offset: -80 }); } }));
    } catch (e) {}
  }
  const k = coarse ? .45 : 1; // motion damping

  // masthead letter split (aria-label kept on h1)
  const mh = document.querySelector(".masthead");
  mh.innerHTML = [...mh.textContent].map(c => `<span class="ch" aria-hidden="true">${c}</span>`).join("");
  gsap.from(".masthead .ch", { yPercent: 110, rotate: 8, opacity: 0, duration: .9, ease: "back.out(1.6)", stagger: .045, delay: .1 });
  gsap.from(".kicker, .hero-btns .btn, .hero .ca-box, .scam", { y: 24, opacity: 0, duration: .7, stagger: .08, delay: .45, ease: "power3.out", clearProps: "transform" });
  gsap.from(".hero-ant", { scale: .9, opacity: 0, duration: 1.2, ease: "power3.out" });
  gsap.from(".chip", { scale: 0, opacity: 0, duration: .6, stagger: .12, delay: .8, ease: "back.out(2)" });

  // word splits
  document.querySelectorAll(".split-words").forEach(el => {
    const nodes = [...el.childNodes]; el.setAttribute("aria-label", el.textContent.trim()); el.innerHTML = "";
    nodes.forEach(n => { if (n.nodeType === 3) n.textContent.split(/(\s+)/).forEach(p => { if (!p) return; if (/^\s+$/.test(p)) el.append(" "); else { const s = document.createElement("span"); s.className = "w"; s.setAttribute("aria-hidden", "true"); s.textContent = p; el.append(s); } }); else el.append(n); });
    const ws = el.querySelectorAll(".w");
    if (el.closest(".hero")) gsap.from(ws, { y: 20, opacity: 0, stagger: .04, duration: .5, delay: .4 });
    else gsap.from(ws, { yPercent: 80, opacity: 0, rotate: 4, stagger: .06, duration: .7, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%" } });
  });

  // pinned layered-parallax hero
  const htl = gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: coarse ? "+=25%" : "+=70%", pin: true, scrub: .6, anticipatePin: 1 } });
  htl.to(".hero-word", { xPercent: -45 * k, ease: "none" }, 0)
     .to(".hero-ant", { yPercent: -10 * k, scale: 1 + .06 * k, ease: "none" }, 0)
     .to(".chip.c1", { y: -90 * k, x: -20 * k, ease: "none" }, 0)
     .to(".chip.c2", { y: -140 * k, ease: "none" }, 0)
     .to(".chip.c3", { y: -60 * k, x: 30 * k, ease: "none" }, 0)
     .to(".s1", { y: -30 * k, ease: "none" }, 0).to(".s2", { y: -55 * k, ease: "none" }, 0).to(".s3", { y: -80 * k, ease: "none" }, 0)
     .to(".hero-copy", { y: -40 * k, ease: "none" }, 0);

  // tunnel draw (stroke-dashoffset scrub)
  function setupTunnel() {
    const len = tline.getTotalLength(); tline.style.strokeDasharray = `${len}`; tline.style.strokeDashoffset = `${len}`;
    return gsap.to(tline, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: ug, start: "top 70%", end: "bottom bottom", scrub: .5 } });
  }
  let tAnim = setupTunnel();

  // banner clip-path reveal + pan-zoom
  gsap.fromTo("#bannerClip", { clipPath: "inset(18% 22% 18% 22% round 32px)" }, { clipPath: "inset(0% 0% 0% 0% round 32px)", ease: "none", scrollTrigger: { trigger: ".banner-sec", start: "top 90%", end: "top 30%", scrub: .6 } });
  gsap.fromTo("#bannerImg", { scale: 1.25, xPercent: -3 }, { scale: 1, xPercent: 3, ease: "none", scrollTrigger: { trigger: ".banner-sec", start: "top bottom", end: "bottom top", scrub: true } });

  // signature pinned scene: crumb run fills the colony gauge
  ScrollTrigger.create({ trigger: "#strength", start: coarse ? "top 10%" : "top top", end: coarse ? "+=60%" : "+=120%", pin: true, scrub: .4, onUpdate: s => setRun(s.progress), onLeave: () => setRun(1) });

  // batch reveals
  ScrollTrigger.batch(".reveal", { start: "top 88%", once: true, onEnter: b => gsap.to(b, { opacity: 1, y: 0, stagger: .1, duration: .8, ease: "power3.out", overwrite: true }) });

  // counters
  document.querySelectorAll(".count").forEach(c => { const to = +c.dataset.to, o = { v: 0 }; if (!to) return; c.textContent = "0"; gsap.to(o, { v: to, duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: c, start: "top 90%", once: true }, onUpdate: () => c.textContent = Math.round(o.v) }); });

  // ribbons speed up with scroll velocity
  if (!coarse) ScrollTrigger.create({ onUpdate: s => { const v = Math.min(3, 1 + Math.abs(s.getVelocity()) / 1500); document.querySelectorAll(".ribbon .track").forEach(t => t.getAnimations().forEach(a => a.playbackRate = v)); } });

  let rT; addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(() => { tline = buildTunnel(); tAnim.scrollTrigger.kill(); tAnim.kill(); tAnim = setupTunnel(); ScrollTrigger.refresh(); }, 250); });
  addEventListener("load", () => { tline = buildTunnel(); tAnim.scrollTrigger.kill(); tAnim.kill(); tAnim = setupTunnel(); ScrollTrigger.refresh(); });
})();
