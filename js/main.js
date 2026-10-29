/* Ganesh Sapkota: portfolio interactions.
   Everything here is an enhancement; the page reads fine without it. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- toast ---------- */
  var toastEl = $("#toast");
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2200);
  }

  /* ---------- theme ---------- */
  var themeBtn = $("#themeBtn");
  function currentTheme() {
    var t = doc.getAttribute("data-theme");
    if (t) return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function syncThemeButton() {
    if (!themeBtn) return;
    themeBtn.setAttribute("aria-label", currentTheme() === "dark" ? "Switch to light theme" : "Switch to dark theme");
  }
  function toggleTheme() {
    var next = currentTheme() === "dark" ? "light" : "dark";
    doc.setAttribute("data-theme", next);
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncThemeButton();
    toast(next === "dark" ? "Dark theme" : "Light theme");
  }
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);
  syncThemeButton();

  /* ---------- mobile menu ---------- */
  var topbar = $("#topbar");
  var menuBtn = $("#menuBtn");
  function setMenu(open) {
    if (!topbar || !menuBtn) return;
    topbar.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (menuBtn) menuBtn.addEventListener("click", function () { setMenu(!topbar.classList.contains("open")); });
  $$(".tabs a").forEach(function (a) {
    a.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* ---------- reading progress ---------- */
  var bar = $("#progress");
  function updateProgress() {
    var h = doc.scrollHeight - window.innerHeight;
    var p = h > 0 ? Math.min(1, window.scrollY / h) : 0;
    if (bar) bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
  }
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { updateProgress(); ticking = false; });
  }, { passive: true });
  updateProgress();

  /* ---------- scroll spy (tabs follow the section in view) ---------- */
  var navLinks = $$(".tabs a");
  var sections = $$("main section[id]");
  function tabOf(sec) { return sec.getAttribute("data-tab") || sec.id; }
  function setActive(tab) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute("href") === "#" + tab;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  var visible = {}, atBottom = false;
  function pickActive() {
    if (atBottom) { setActive("contact"); return; }
    var best = null, bestVal = 0;
    sections.forEach(function (s) { if ((visible[s.id] || 0) > bestVal) { best = s; bestVal = visible[s.id]; } });
    if (best) setActive(tabOf(best));
  }
  if ("IntersectionObserver" in window && sections.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { visible[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0; });
      pickActive();
    }, { rootMargin: "-12% 0px -55% 0px", threshold: [0, 0.1, 0.4, 1] });
    sections.forEach(function (s) { io.observe(s); });
  }
  window.addEventListener("scroll", function () {
    var now = window.innerHeight + window.scrollY >= doc.scrollHeight - 6;
    if (now !== atBottom) { atBottom = now; pickActive(); }
  }, { passive: true });
  setActive("top");

  /* ---------- project filters ---------- */
  var chips = $$(".filters .chip");
  var cards = $$("#projectList .project");
  var emptyMsg = $("#emptyMsg");
  function applyFilter(key) {
    var shown = 0;
    cards.forEach(function (c) {
      var ok = key === "all" || c.getAttribute("data-cat") === key;
      c.hidden = !ok;
      if (ok) shown++;
    });
    chips.forEach(function (b) {
      var on = b.getAttribute("data-filter") === key;
      b.classList.toggle("is-on", on);
      b.setAttribute("aria-pressed", String(on));
    });
    if (emptyMsg) emptyMsg.hidden = shown > 0;
  }
  chips.forEach(function (b) {
    b.addEventListener("click", function () { applyFilter(b.getAttribute("data-filter")); });
  });

  /* ---------- method stepper (tabs) ---------- */
  var tabs = $$("#stepper [role=tab]");
  var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute("aria-controls")); });
  function selectTab(idx, focus) {
    tabs.forEach(function (t, k) {
      var on = k === idx;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      if (panels[k]) panels[k].hidden = !on;
    });
    if (focus) tabs[idx].focus();
  }
  if (tabs.length) {
    selectTab(0, false);
    tabs.forEach(function (t, k) {
      t.addEventListener("click", function () { selectTab(k, false); });
      t.addEventListener("keydown", function (e) {
        var n = tabs.length, to = null;
        if (e.key === "ArrowRight" || e.key === "ArrowDown") to = (k + 1) % n;
        else if (e.key === "ArrowLeft" || e.key === "ArrowUp") to = (k - 1 + n) % n;
        else if (e.key === "Home") to = 0;
        else if (e.key === "End") to = n - 1;
        if (to !== null) { e.preventDefault(); selectTab(to, true); }
      });
    });
  }

  /* ---------- copy email ---------- */
  $$("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () { copyText(b.getAttribute("data-copy")); });
  });
  function copyText(text) {
    function done() { toast("Email address copied"); }
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); done(); } catch (e) { toast("Copy failed. Select the address and copy it."); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
  }

  /* ---------- lightbox ---------- */
  var lb = $("#lightbox");
  var lbImg = $("#lbImg"), lbCap = $("#lbCap"), lbCount = $("#lbCount");
  var group = [], pos = 0, lastFocus = null;

  function collectGroup(name) {
    var seen = {}, out = [];
    $$('a[data-lightbox="' + name + '"]').forEach(function (a) {
      var href = a.getAttribute("href");
      if (seen[href]) return;
      seen[href] = true;
      out.push({ src: href, cap: a.getAttribute("data-caption") || "" });
    });
    return out;
  }
  function showPhoto(k) {
    pos = (k + group.length) % group.length;
    var g = group[pos];
    lbImg.src = g.src;
    lbImg.alt = g.cap;
    lbCap.textContent = g.cap;
    lbCount.textContent = group.length > 1 ? (pos + 1) + " / " + group.length : "";
    lb.classList.toggle("single", group.length < 2);
    var nxt = group[(pos + 1) % group.length];
    if (nxt) { var pre = new Image(); pre.src = nxt.src; }
  }
  function openLightbox(name, href) {
    if (!lb || typeof lb.showModal !== "function") return false;
    group = collectGroup(name);
    var start = 0;
    group.forEach(function (g, k) { if (g.src === href) start = k; });
    lastFocus = document.activeElement;
    showPhoto(start);
    if (!lb.open) lb.showModal();
    return true;
  }
  document.addEventListener("click", function (e) {
    var a = e.target.closest ? e.target.closest("a[data-lightbox]") : null;
    if (!a || e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (openLightbox(a.getAttribute("data-lightbox"), a.getAttribute("href"))) e.preventDefault();
  });
  if (lb) {
    $("#lbClose").addEventListener("click", function () { lb.close(); });
    $("#lbPrev").addEventListener("click", function () { showPhoto(pos - 1); });
    $("#lbNext").addEventListener("click", function () { showPhoto(pos + 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) lb.close(); });
    lb.addEventListener("close", function () { if (lastFocus && lastFocus.focus) lastFocus.focus(); });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight") { e.preventDefault(); showPhoto(pos + 1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); showPhoto(pos - 1); }
    });
    var sx = null;
    lb.addEventListener("touchstart", function (e) { sx = e.changedTouches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", function (e) {
      if (sx === null) return;
      var dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 50 && group.length > 1) showPhoto(pos + (dx < 0 ? 1 : -1));
      sx = null;
    }, { passive: true });
  }

  /* ---------- command palette ---------- */
  var pal = $("#palette"), palInput = $("#paletteInput"), palList = $("#paletteList");
  var items = [], results = [], sel = 0;

  function buildItems() {
    items = [];
    $$(".tabs a").forEach(function (a) {
      items.push({ label: a.textContent.trim(), kind: "Section", run: function () { go(a.getAttribute("href")); } });
    });
    $$("#projectList .project").forEach(function (p) {
      items.push({ label: p.getAttribute("data-title"), kind: "Project", run: function () { applyFilter("all"); go("#" + p.id); } });
    });
    items.push({ label: "Go-kart win, Mechtrix 2080", kind: "Campus", run: function () { go("#p-gokart"); } });
    items.push({ label: "Final-year thesis: bamboo panel machine", kind: "Campus", run: function () { go("#p-bamboo"); } });
    items.push({ label: "Suffosafe minor project", kind: "Campus", run: function () { go("#p-suffosafe"); } });
    items.push({ label: "Life at Aristotle University of Thessaloniki", kind: "Campus", run: function () { go("#life"); } });
    items.push({ label: "Life at Pulchowk Campus", kind: "Campus", run: function () { go("#campus"); } });
    items.push({ label: "Sports winner: tug of war, running, cricket", kind: "Campus", run: function () { go("#p-sports"); } });
    items.push({ label: "Hosting the M.Sc. Hostel program", kind: "Campus", run: function () { go("#p-hostel"); } });
    items.push({ label: "Field visit: Renewable Energy Engineering", kind: "Campus", run: function () { go("#p-fieldvisit"); } });
    items.push({ label: "Graduation day", kind: "Campus", run: function () { go("#p-graduation"); } });
    items.push({ label: "Download CV", kind: "Action", run: function () { var a = document.createElement("a"); a.href = "assets/cv/Ganesh_Sapkota_CV.pdf?v=20261024-4"; a.download = "Ganesh_Sapkota_CV.pdf"; document.body.appendChild(a); a.click(); a.remove(); } });
    items.push({ label: "Copy email address", kind: "Action", run: function () { copyText("sapkotaganesh2058@gmail.com"); } });
    items.push({ label: "Open LinkedIn", kind: "Action", run: function () { window.open("https://www.linkedin.com/in/ganesh-sapkota-92aa942b7/", "_blank", "noopener"); } });
    items.push({ label: "Switch theme", kind: "Action", run: toggleTheme });
    items.push({ label: "MSc thesis: production scheduling", kind: "Section", run: function () { go("#education"); } });
    items.push({ label: "How I work", kind: "Section", run: function () { go("#method"); } });
    items.push({ label: "Awards", kind: "Section", run: function () { go("#awards"); } });
    items.push({ label: "Erasmus in Thessaloniki", kind: "Section", run: function () { go("#p-erasmus"); } });
  }
  function go(hash) {
    var el = $(hash);
    if (el) {
      el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
      if (history.replaceState) history.replaceState(null, "", hash);
    }
  }
  function renderPalette(q) {
    q = (q || "").trim().toLowerCase();
    results = items.filter(function (it) { return !q || it.label.toLowerCase().indexOf(q) !== -1 || it.kind.toLowerCase().indexOf(q) !== -1; });
    sel = 0;
    palList.innerHTML = "";
    if (!results.length) {
      var li = document.createElement("li");
      li.className = "none"; li.textContent = "Nothing found. Try \"energy\" or \"thesis\".";
      palList.appendChild(li);
      return;
    }
    results.forEach(function (it, k) {
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.id = "pal-" + k;
      li.setAttribute("aria-selected", String(k === 0));
      var s = document.createElement("span"); s.textContent = it.label;
      var m = document.createElement("small"); m.textContent = it.kind;
      li.appendChild(s); li.appendChild(m);
      li.addEventListener("mousemove", function () { highlight(k); });
      li.addEventListener("click", function () { choose(k); });
      palList.appendChild(li);
    });
    palInput.setAttribute("aria-activedescendant", "pal-0");
  }
  function highlight(k) {
    sel = k;
    $$("li", palList).forEach(function (li, n) { li.setAttribute("aria-selected", String(n === k)); });
    var cur = palList.children[k];
    if (cur) { palInput.setAttribute("aria-activedescendant", cur.id); if (cur.scrollIntoView) cur.scrollIntoView({ block: "nearest" }); }
  }
  function choose(k) {
    var it = results[k];
    if (!it) return;
    pal.close();
    setTimeout(function () { it.run(); }, 30);
  }
  function openPalette() {
    if (!pal || typeof pal.showModal !== "function") return;
    if (!items.length) buildItems();
    palInput.value = "";
    renderPalette("");
    if (!pal.open) pal.showModal();
    palInput.focus();
  }
  if (pal) {
    palInput.addEventListener("input", function () { renderPalette(palInput.value); });
    palInput.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown") { e.preventDefault(); if (results.length) highlight((sel + 1) % results.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); if (results.length) highlight((sel - 1 + results.length) % results.length); }
      else if (e.key === "Enter") { e.preventDefault(); choose(sel); }
    });
    pal.addEventListener("click", function (e) { if (e.target === pal) pal.close(); });
  }
  var palBtn = $("#paletteBtn");
  if (palBtn) palBtn.addEventListener("click", openPalette);
  document.addEventListener("keydown", function (e) {
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((e.target.tagName || ""));
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); openPalette(); }
    else if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey) { e.preventDefault(); openPalette(); }
  });

  /* ---------- footer year ---------- */
  var yr = $("#year");
  if (yr) yr.textContent = String(new Date().getFullYear());
})();
