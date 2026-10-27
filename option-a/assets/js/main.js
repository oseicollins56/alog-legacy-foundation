// ALOG Legacy Foundation - site behaviour
(function () {
  "use strict";

  // Main WhatsApp number (international format, no + or spaces)
  var WHATSAPP_NUMBER = "233549013477";

  function openWhatsApp(text) {
    var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);
    window.open(url, "_blank", "noopener");
  }

  // ---------- Mobile navigation ----------
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function closeNav() {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) closeNav();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && nav.classList.contains("is-open")) {
      closeNav();
      toggle.focus();
    }
  });

  // ---------- Header shadow on scroll ----------
  var header = document.querySelector(".site-header");
  function onScroll() {
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Highlight the current section in the nav ----------
  var links = Array.prototype.slice.call(document.querySelectorAll('.site-nav ul a[href^="#"]'));
  if ("IntersectionObserver" in window) {
    var byId = {};
    links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && byId[entry.target.id]) {
          links.forEach(function (a) { a.classList.remove("is-active"); });
          byId[entry.target.id].classList.add("is-active");
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(byId).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }

  // ---------- Donation form ----------
  var donateForm = document.getElementById("donate-form");
  var donateLabel = document.getElementById("donate-label");
  var donateError = document.getElementById("donate-error");
  var programSelect = document.getElementById("donate-program");
  var customInput = donateForm.elements.custom;

  function currentAmount() {
    var custom = parseFloat(customInput.value);
    if (custom > 0) return custom;
    var picked = donateForm.querySelector('input[name="amount"]:checked');
    return picked ? parseFloat(picked.value) : 0;
  }

  function formatCedis(n) {
    return "GH₵ " + n.toLocaleString("en-GH", { maximumFractionDigits: 2 });
  }

  function updateDonateLabel() {
    var amount = currentAmount();
    var monthly = donateForm.elements.frequency.value === "monthly";
    donateLabel.textContent = amount > 0
      ? "Give " + formatCedis(amount) + (monthly ? " a month" : "") + " via WhatsApp"
      : "Give via WhatsApp";
  }

  donateForm.addEventListener("change", function (e) {
    if (e.target.name === "amount") customInput.value = "";
    updateDonateLabel();
  });

  customInput.addEventListener("input", function () {
    if (customInput.value) {
      donateForm.querySelectorAll('input[name="amount"]').forEach(function (r) { r.checked = false; });
    }
    donateError.hidden = true;
    updateDonateLabel();
  });

  donateForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var amount = currentAmount();
    if (!(amount > 0)) {
      donateError.textContent = "Choose an amount or enter your own to continue.";
      donateError.hidden = false;
      customInput.focus();
      return;
    }
    donateError.hidden = true;
    var monthly = donateForm.elements.frequency.value === "monthly";
    openWhatsApp(
      "Hello ALOG Legacy Foundation, I would like to give " + formatCedis(amount) +
      (monthly ? " every month" : "") + " towards: " + programSelect.value +
      ". Please send me the payment details."
    );
  });

  // "+" buttons on program cards pre-select that program
  document.querySelectorAll("[data-program]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var name = btn.getAttribute("data-program");
      Array.prototype.forEach.call(programSelect.options, function (opt) {
        if (opt.text === name) programSelect.value = opt.value || opt.text;
      });
    });
  });

  updateDonateLabel();

  // ---------- Contact form ----------
  var contactForm = document.getElementById("contact-form");
  var contactError = document.getElementById("contact-error");

  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var f = contactForm.elements;
    var name = f.name.value.trim();
    var message = f.message.value.trim();
    if (!name || !message) {
      contactError.textContent = !name ? "Add your name so we know who to reply to." : "Write a short message before sending.";
      contactError.hidden = false;
      (!name ? f.name : f.message).focus();
      return;
    }
    contactError.hidden = true;
    var text = "Hello ALOG Legacy Foundation, my name is " + name + ". I'd like to: " + f.reason.value + ".\n\n" + message;
    if (f.phone.value.trim()) text += "\n\nMy phone: " + f.phone.value.trim();
    openWhatsApp(text);
  });

  // ---------- Gallery arrows ----------
  var track = document.getElementById("gallery-track");
  document.querySelectorAll(".gallery__nav button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var step = track.clientWidth * 0.8 * Number(btn.getAttribute("data-dir"));
      track.scrollBy({ left: step, behavior: "smooth" });
    });
  });

  // ---------- Footer year ----------
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
})();
