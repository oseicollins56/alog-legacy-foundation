// ALOG Legacy Foundation, Option B - site behaviour
(function () {
  "use strict";

  // Main WhatsApp number (international format, no + or spaces)
  var WHATSAPP_NUMBER = "233558472722";

  function openWhatsApp(text) {
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener");
  }

  var header = document.querySelector(".site-header");

  // ---------- Mobile navigation ----------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNav(open) {
    if (open) {
      // the phone menu fills the screen from just under the header
      nav.style.setProperty("--nav-top", Math.max(0, header.getBoundingClientRect().bottom) + "px");
    }
    nav.classList.toggle("is-open", open);
    document.body.classList.toggle("nav-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  }
  function closeNav() { setNav(false); }
  toggle.addEventListener("click", function () { setNav(!nav.classList.contains("is-open")); });
  window.addEventListener("resize", function () { if (window.innerWidth > 900 && nav.classList.contains("is-open")) closeNav(); });
  nav.addEventListener("click", function (e) { if (e.target.closest("a")) closeNav(); });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) { closeNav(); toggle.focus(); }
  });

  // ---------- Header shadow ----------
  function onScroll() { header.classList.toggle("is-scrolled", window.scrollY > 8); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Active nav link ----------
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav ul a[href^="#"]'));
  if ("IntersectionObserver" in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && byId[entry.target.id]) {
          links.forEach(function (a) { a.classList.remove("is-active"); });
          byId[entry.target.id].classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) io.observe(el); });
  }

  // ---------- Hero slider ----------
  var hero = document.querySelector(".hero");
  var slides = Array.prototype.slice.call(document.querySelectorAll(".slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero__dots button"));
  var current = 0;
  var timer = null;
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function show(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach(function (s, n) {
      var active = n === current;
      s.classList.toggle("is-active", active);
      s.setAttribute("aria-hidden", String(!active));
      s.querySelectorAll("a").forEach(function (a) { a.tabIndex = active ? 0 : -1; });
    });
    dots.forEach(function (d, n) { d.setAttribute("aria-selected", String(n === current)); });
  }
  function start() { if (!reduceMotion && !timer) timer = setInterval(function () { show(current + 1); }, 6500); }
  function stop() { clearInterval(timer); timer = null; }

  dots.forEach(function (d, n) { d.addEventListener("click", function () { show(n); stop(); start(); }); });
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  hero.addEventListener("focusin", stop);
  hero.addEventListener("focusout", start);
  // Finger swipe on phones (auto-advance carries on afterwards)
  var touchX = null, touchY = null;
  var slideBox = document.querySelector(".hero__slides");
  slideBox.addEventListener("touchstart", function (e) {
    touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; stop();
  }, { passive: true });
  slideBox.addEventListener("touchend", function (e) {
    if (touchX !== null) {
      var dx = e.changedTouches[0].clientX - touchX;
      var dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) show(current + (dx < 0 ? 1 : -1));
    }
    touchX = null; start();
  }, { passive: true });

  // Pause while the tab is hidden, so phones don't burn battery
  document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });

  show(0);
  start();

  // ---------- Swipeable card rows (phones) ----------
  document.querySelectorAll("[data-swipe]").forEach(function (row, r) {
    var items = Array.prototype.slice.call(row.children);
    if (items.length < 2) return;
    var dotsBox = document.createElement("div");
    dotsBox.className = "swipe-dots";
    var dotBtns = items.map(function (item, n) {
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show item " + (n + 1) + " of " + items.length);
      b.addEventListener("click", function () {
        row.scrollTo({ left: item.offsetLeft - row.offsetLeft - 16, behavior: reduceMotion ? "auto" : "smooth" });
      });
      dotsBox.appendChild(b);
      return b;
    });
    row.insertAdjacentElement("afterend", dotsBox);
    function mark() {
      var mid = row.scrollLeft + row.clientWidth / 2, best = 0, bestD = Infinity;
      items.forEach(function (item, n) {
        var c = item.offsetLeft - row.offsetLeft + item.offsetWidth / 2;
        var d = Math.abs(c - mid); if (d < bestD) { bestD = d; best = n; }
      });
      if (row.scrollLeft < 8) best = 0;
      if (row.scrollLeft + row.clientWidth >= row.scrollWidth - 8) best = items.length - 1;
      dotBtns.forEach(function (b, n) { b.setAttribute("aria-current", String(n === best)); });
    }
    row.addEventListener("scroll", function () { window.requestAnimationFrame(mark); }, { passive: true });
    mark();
  });

  // Hide the bottom action bar while someone is typing in a form
  document.addEventListener("focusin", function (e) {
    if (e.target.matches("input, textarea, select")) document.body.classList.add("is-typing");
  });
  document.addEventListener("focusout", function () { document.body.classList.remove("is-typing"); });

  // ---------- Donation band ----------
  var form = document.getElementById("donate-form");
  var btn = document.getElementById("donate-btn");
  var err = document.getElementById("donate-error");
  var cause = document.getElementById("donate-cause");
  var custom = form.elements.custom;

  function amount() {
    var c = parseFloat(custom.value);
    if (c > 0) return c;
    var r = form.querySelector('input[name="amount"]:checked');
    return r ? parseFloat(r.value) : 0;
  }
  function cedis(n) { return "GH₵ " + n.toLocaleString("en-GH", { maximumFractionDigits: 2 }); }
  function label() { var a = amount(); btn.textContent = a > 0 ? "Give " + cedis(a) + " via WhatsApp" : "Give via WhatsApp"; }

  form.addEventListener("change", function (e) { if (e.target.name === "amount") custom.value = ""; label(); });
  custom.addEventListener("input", function () {
    if (custom.value) form.querySelectorAll('input[name="amount"]').forEach(function (r) { r.checked = false; });
    err.hidden = true; label();
  });
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var a = amount();
    if (!(a > 0)) { err.textContent = "Choose an amount or enter your own to continue."; err.hidden = false; custom.focus(); return; }
    err.hidden = true;
    openWhatsApp("Hello ALOG Legacy Foundation, I would like to give " + cedis(a) + " towards: " + cause.value + ". Please send me the payment details.");
  });

  document.querySelectorAll("[data-cause]").forEach(function (link) {
    link.addEventListener("click", function () { cause.value = link.getAttribute("data-cause"); });
  });
  label();

  // ---------- Contact form ----------
  var cform = document.getElementById("contact-form");
  var cerr = document.getElementById("contact-error");
  cform.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("c-name").value.trim();
    var msg = document.getElementById("c-message").value.trim();
    var phone = document.getElementById("c-phone").value.trim();
    if (!name || !msg) {
      cerr.textContent = !name ? "Add your name so we know who to reply to." : "Write a short message before sending.";
      cerr.hidden = false;
      document.getElementById(!name ? "c-name" : "c-message").focus();
      return;
    }
    cerr.hidden = true;
    var text = "Hello ALOG Legacy Foundation, my name is " + name + ". I'd like to: " + document.getElementById("c-reason").value + ".\n\n" + msg;
    if (phone) text += "\n\nMy phone: " + phone;
    openWhatsApp(text);
  });

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
