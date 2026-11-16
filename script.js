/* Portfolio interactions: splash, 3D hero, scroll motion, cursor, tilt.
   Everything degrades gracefully: no WebGL, no GSAP, or reduced motion still shows full content. */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = window.matchMedia("(hover: none), (pointer: coarse)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var hasGSAP = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";
  if (hasGSAP) gsap.registerPlugin(ScrollTrigger);

  /* ---------- clock + "viewed at" ---------- */
  function fmt(d) { return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
  function tick() { var t = fmt(new Date()); $("#clock").textContent = t; }
  tick(); setInterval(tick, 30000);
  $("#viewed").textContent = "This portfolio was viewed at " + fmt(new Date()) + ". Hope your day is going well.";

  /* ---------- splash ---------- */
  var splash = $("#splash"), typed = $("#typed"), enter = $("#enter");
  var msg = "// available to shape brands worth remembering.";
  var i = 0;
  function type() {
    if (i <= msg.length) { typed.textContent = msg.slice(0, i++); setTimeout(type, reduce ? 0 : 28); }
    else enter.classList.add("is-ready");
  }
  type();
  function openSite() {
    document.body.classList.remove("is-locked");
    if (hasGSAP && !reduce) {
      gsap.to(splash, { yPercent: -100, duration: 0.9, ease: "power4.inOut", onComplete: function () { splash.remove(); } });
      heroIn(0.5);
    } else { splash.remove(); }
  }
  enter.addEventListener("click", openSite);
  enter.focus({ preventScroll: true });

  function heroIn(delay) {
    gsap.from(".hero__title .word", { yPercent: 110, duration: 1.1, ease: "power4.out", stagger: 0.12, delay: delay });
    gsap.from([".eyebrow", ".hero__lede", ".hero__cta"], { y: 24, opacity: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, delay: delay + 0.5 });
  }

  /* ---------- scroll progress + nav ---------- */
  var bar = $("#progress");
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = "scaleX(" + (h > 0 ? scrollY / h : 0) + ")";
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- statement: word-by-word highlight on scroll ---------- */
  var st = $("#statement");
  var words = st.textContent.trim().split(/\s+/);
  st.setAttribute("aria-label", words.join(" "));
  st.innerHTML = words.map(function (w) { return '<span class="w" aria-hidden="true">' + w + "</span>"; }).join(" ");
  var spans = $$(".w", st);
  function lightWords() {
    var r = st.getBoundingClientRect();
    var p = (innerHeight * 0.85 - r.top) / (r.height + innerHeight * 0.35);
    p = Math.max(0, Math.min(1, p));
    var n = Math.round(p * spans.length);
    spans.forEach(function (s, k) { s.classList.toggle("on", k < n); });
  }
  if (!reduce) { addEventListener("scroll", lightWords, { passive: true }); lightWords(); }

  /* ---------- scroll reveals for non-card blocks ---------- */
  if (hasGSAP && !reduce) {
    $$(".h2, .timeline li, .faq details, .facts > div").forEach(function (el) {
      gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true } });
    });
    gsap.from(".contact__big", { y: 60, opacity: 0, duration: 1.1, ease: "power4.out",
      scrollTrigger: { trigger: ".contact", start: "top 70%", once: true } });
  }

  /* ---------- custom cursor + magnetic buttons ---------- */
  var cur = $("#cursor");
  if (!coarse && !reduce) {
    var cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener("mousemove", function (e) { tx = e.clientX; ty = e.clientY; cur.classList.add("is-on"); });
    (function loop() { cx += (tx - cx) * 0.2; cy += (ty - cy) * 0.2; cur.style.transform = "translate(" + cx + "px," + cy + "px)"; requestAnimationFrame(loop); })();
    $$("a, button, summary, .card").forEach(function (el) {
      el.addEventListener("mouseenter", function () { cur.classList.add("is-big"); });
      el.addEventListener("mouseleave", function () { cur.classList.remove("is-big"); });
    });
    $$(".magnetic").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        el.style.transform = "translate(" + (e.clientX - r.left - r.width / 2) * 0.25 + "px," + (e.clientY - r.top - r.height / 2) * 0.35 + "px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
    /* 3D tilt on skill cards */
    $$(".tilt").forEach(function (el) {
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = "perspective(700px) rotateY(" + x * 12 + "deg) rotateX(" + -y * 12 + "deg) translateZ(6px)";
      });
      el.addEventListener("mouseleave", function () { el.style.transform = ""; });
    });
  }

  /* ---------- 3D hero (Three.js) ---------- */
  var canvas = $("#gl");
  if (typeof THREE === "undefined" || reduce) { canvas.style.display = "none"; return; }
  var renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true }); }
  catch (err) { canvas.style.display = "none"; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 7;

  var group = new THREE.Group(); scene.add(group);
  var geo = new THREE.IcosahedronGeometry(2, 3);
  var base = geo.attributes.position.array.slice();
  var wire = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color: 0xc6ff3d, wireframe: true, transparent: true, opacity: 0.55 }));
  group.add(wire);
  var core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), new THREE.MeshBasicMaterial({ color: 0xf2efe8, wireframe: true, transparent: true, opacity: 0.25 }));
  group.add(core);

  var N = coarse ? 500 : 1400, pos = new Float32Array(N * 3);
  for (var k = 0; k < N; k++) {
    var r = 3.2 + Math.random() * 5, a = Math.random() * Math.PI * 2, b = Math.acos(2 * Math.random() - 1);
    pos[k * 3] = r * Math.sin(b) * Math.cos(a); pos[k * 3 + 1] = r * Math.sin(b) * Math.sin(a); pos[k * 3 + 2] = r * Math.cos(b);
  }
  var pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  var pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xf2efe8, size: 0.02, transparent: true, opacity: 0.7 }));
  scene.add(pts);

  var mx = 0, my = 0, sy = 0;
  addEventListener("mousemove", function (e) { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; });
  addEventListener("scroll", function () { sy = scrollY; }, { passive: true });

  function resize() {
    var w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    group.position.x = w > 900 ? 2.4 : 0; group.position.y = w > 900 ? 0 : 1.4;
    group.scale.setScalar(w > 900 ? 1 : 0.75);
    camera.updateProjectionMatrix();
  }
  resize(); addEventListener("resize", resize);

  var visible = true;
  new IntersectionObserver(function (e) { visible = e[0].isIntersecting; }).observe($("#hero"));
  var clock = new THREE.Clock();
  (function frame() {
    requestAnimationFrame(frame);
    if (!visible || document.hidden) return;
    var t = clock.getElapsedTime();
    var p = geo.attributes.position.array;
    for (var j = 0; j < p.length; j += 3) {
      var bx = base[j], by = base[j + 1], bz = base[j + 2];
      var d = 1 + 0.12 * Math.sin(bx * 1.6 + t * 1.2) * Math.cos(by * 1.4 + t * 0.9) + 0.05 * Math.sin(bz * 3 + t * 2);
      p[j] = bx * d; p[j + 1] = by * d; p[j + 2] = bz * d;
    }
    geo.attributes.position.needsUpdate = true;
    group.rotation.y += (mx * 1.2 + t * 0.15 - group.rotation.y) * 0.05;
    group.rotation.x += (my * 0.9 + sy * 0.0012 - group.rotation.x) * 0.05;
    core.rotation.y = -t * 0.4; pts.rotation.y = t * 0.03 + sy * 0.0004;
    renderer.render(scene, camera);
  })();
})();
