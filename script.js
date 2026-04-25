const ANDROID_URL = "#";
const IOS_URL = "#";
const SUPPORT_RECIPIENT = "hello@blenmatch.com";

const LANG_KEY = "blen-lang";
const SUPPORTED_LANGS = ["en", "ko"];
const PAGE_KEYS = ["home", "about", "terms", "privacy", "support"];

const PAGE_PATHS = {
  home: "",
  about: "about",
  terms: "terms",
  privacy: "privacy",
  support: "support",
};

function getSavedLang() {
  const lang = localStorage.getItem(LANG_KEY);
  return SUPPORTED_LANGS.includes(lang) ? lang : "en";
}

function setSavedLang(lang) {
  if (SUPPORTED_LANGS.includes(lang)) localStorage.setItem(LANG_KEY, lang);
}

function getCurrentLang() {
  const bodyLang = document.body.dataset.locale;
  if (SUPPORTED_LANGS.includes(bodyLang)) return bodyLang;
  const firstPath = location.pathname.split("/").filter(Boolean)[0];
  return SUPPORTED_LANGS.includes(firstPath) ? firstPath : "en";
}

function getCurrentPage() {
  const key = document.body.dataset.page;
  return PAGE_KEYS.includes(key) ? key : "home";
}

function localeUrl(lang, page) {
  if (page === "home") return `/${lang}/`;
  return `/${lang}/${PAGE_PATHS[page]}/`;
}

function setActiveLangButton(lang) {
  document.querySelectorAll(".site-lang__option").forEach((btn) => {
    const active = btn.dataset.setLang === lang;
    btn.classList.toggle("site-lang__option--active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.setAttribute("aria-current", active ? "true" : "false");
    const check = btn.querySelector(".site-lang__check");
    if (check) check.hidden = !active;
  });
}

function deepGet(obj, path) {
  return path.split(".").reduce((acc, key) => (acc ? acc[key] : undefined), obj);
}

function applyI18n(locale) {
  document.documentElement.lang = locale;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const value = deepGet(window.__BLEN_LOCALE__, el.dataset.i18n);
    if (typeof value === "string") el.textContent = value;
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const value = deepGet(window.__BLEN_LOCALE__, el.dataset.i18nHtml);
    if (typeof value === "string") el.innerHTML = value;
  });

  document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
    const attr = el.dataset.i18nAttr;
    const key = el.dataset.i18nKey;
    const value = deepGet(window.__BLEN_LOCALE__, key);
    if (attr && typeof value === "string") el.setAttribute(attr, value);
  });

  const page = getCurrentPage();
  const titleMap = {
    home: "meta.titleHome",
    about: "meta.titleAbout",
    terms: "meta.titleTerms",
    privacy: "meta.titlePrivacy",
    support: "meta.titleSupport",
  };
  const pageTitle = deepGet(window.__BLEN_LOCALE__, titleMap[page]);
  if (typeof pageTitle === "string") document.title = pageTitle;

  const footerMap = {
    about: "about",
    terms: "terms",
    privacy: "privacy",
    support: "support",
  };
  document.querySelectorAll("[data-footer-link]").forEach((el) => {
    const pageKey = footerMap[el.dataset.footerLink];
    if (pageKey) el.setAttribute("href", localeUrl(locale, pageKey));
  });
}

async function loadLocale(locale) {
  const response = await fetch(`/locales/${locale}.json`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Locale load failed: ${locale}`);
  return response.json();
}

function closeAllLanguageMenus(except) {
  document.querySelectorAll(".site-lang").forEach((selector) => {
    if (selector !== except) {
      selector.classList.remove("is-open");
      const trigger = selector.querySelector(".site-lang__trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    }
  });
}

function initializeLanguageSelector() {
  const selectors = document.querySelectorAll(".site-lang");
  selectors.forEach((selector) => {
    selector.classList.add("site-lang--dropdown");
    selector.innerHTML = `
      <button type="button" class="site-lang__trigger" aria-label="Select language" aria-expanded="false">
        <span class="site-lang__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" role="presentation" focusable="false">
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M3 12h18"></path>
            <path d="M12 3a14 14 0 0 1 0 18"></path>
            <path d="M12 3a14 14 0 0 0 0 18"></path>
          </svg>
        </span>
      </button>
      <div class="site-lang__menu" role="menu" aria-label="Language options">
        <button type="button" class="site-lang__option" data-set-lang="en" aria-pressed="false" role="menuitemradio">
          <span class="site-lang__label">ENG</span>
          <span class="site-lang__check" aria-hidden="true" hidden>✓</span>
        </button>
        <button type="button" class="site-lang__option" data-set-lang="ko" aria-pressed="false" role="menuitemradio">
          <span class="site-lang__label">KOR</span>
          <span class="site-lang__check" aria-hidden="true" hidden>✓</span>
        </button>
      </div>
    `;

    const headerInner = selector.closest(".site-header__inner");
    const navToggle = headerInner ? headerInner.querySelector(".site-nav-toggle") : null;
    if (headerInner && navToggle && selector.parentElement !== headerInner) {
      headerInner.insertBefore(selector, navToggle);
    }

    const trigger = selector.querySelector(".site-lang__trigger");
    if (trigger) {
      trigger.addEventListener("click", (event) => {
        event.stopPropagation();
        const willOpen = !selector.classList.contains("is-open");
        closeAllLanguageMenus(selector);
        selector.classList.toggle("is-open", willOpen);
        trigger.setAttribute("aria-expanded", willOpen ? "true" : "false");
      });
    }

    selector.querySelectorAll(".site-lang__option").forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetLang = btn.dataset.setLang;
        if (!SUPPORTED_LANGS.includes(targetLang)) return;
        setSavedLang(targetLang);
        selector.classList.remove("is-open");
        if (trigger) trigger.setAttribute("aria-expanded", "false");
        const nextUrl = localeUrl(targetLang, getCurrentPage());
        if (nextUrl !== location.pathname) {
          location.href = nextUrl;
        }
      });
    });
  });

  document.addEventListener("click", (event) => {
    document.querySelectorAll(".site-lang").forEach((selector) => {
      if (selector.contains(event.target)) return;
      selector.classList.remove("is-open");
      const trigger = selector.querySelector(".site-lang__trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  });
}

function bindStoreLinks() {
  document.querySelectorAll(".store-link").forEach((link) => {
    const store = link.dataset.store;
    if (store === "android") link.href = ANDROID_URL;
    if (store === "ios") link.href = IOS_URL;
  });
}

function bindHeaderNav() {
  const nav = document.querySelector(".site-nav");
  const toggle = document.querySelector(".site-nav-toggle");
  if (nav && toggle) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.querySelectorAll(".site-nav__link").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  const page = getCurrentPage();
  const activeMap = {
    home: "home",
    about: "about",
    support: "support",
  };
  const active = activeMap[page];
  document.querySelectorAll(".site-nav__link").forEach((link) => {
    const isActive = !!active && link.dataset.nav === active;
    link.classList.toggle("site-nav__link--active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
}

function initFeatureCarousel() {
  const carousel = document.querySelector("[data-feature-carousel]");
  if (!carousel) return;

  const track = carousel.querySelector("[data-carousel-track]");
  const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const dotsContainer = carousel.querySelector("[data-carousel-dots]");
  if (!track || slides.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let startX = 0;
  let dragging = false;
  let dragOffset = 0;
  const swipeThreshold = 44;

  dotsContainer.innerHTML = slides
    .map(
      (_, index) =>
        `<button type="button" class="feature-carousel__dot${
          index === 0 ? " is-active" : ""
        }" data-carousel-dot="${index}" aria-label="Go to slide ${index + 1}" aria-current="${
          index === 0 ? "true" : "false"
        }"></button>`
    )
    .join("");

  const dots = Array.from(dotsContainer.querySelectorAll("[data-carousel-dot]"));

  function applyPosition(withAnimation = true) {
    track.style.transition = withAnimation ? "transform 340ms ease" : "none";
    track.style.transform = `translateX(calc(${-currentIndex * 100}% + ${dragOffset}px))`;
    dots.forEach((dot, index) => {
      const active = index === currentIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function goTo(index) {
    const total = slides.length;
    currentIndex = (index + total) % total;
    dragOffset = 0;
    applyPosition(true);
  }

  function onPointerDown(event) {
    dragging = true;
    startX = event.clientX;
    dragOffset = 0;
    track.style.transition = "none";
    track.setPointerCapture(event.pointerId);
    if (track.parentElement) track.parentElement.style.cursor = "grabbing";
  }

  function onPointerMove(event) {
    if (!dragging) return;
    dragOffset = event.clientX - startX;
    applyPosition(false);
  }

  function onPointerUp(event) {
    if (!dragging) return;
    dragging = false;
    track.releasePointerCapture(event.pointerId);
    if (track.parentElement) track.parentElement.style.cursor = "grab";
    if (Math.abs(dragOffset) > swipeThreshold) {
      if (dragOffset < 0) goTo(currentIndex + 1);
      else goTo(currentIndex - 1);
      return;
    }
    dragOffset = 0;
    applyPosition(true);
  }

  if (prevButton) prevButton.addEventListener("click", () => goTo(currentIndex - 1));
  if (nextButton) nextButton.addEventListener("click", () => goTo(currentIndex + 1));

  dots.forEach((dot) => {
    dot.addEventListener("click", () => {
      const targetIndex = Number(dot.dataset.carouselDot);
      if (!Number.isNaN(targetIndex)) goTo(targetIndex);
    });
  });

  track.addEventListener("pointerdown", onPointerDown);
  track.addEventListener("pointermove", onPointerMove);
  track.addEventListener("pointerup", onPointerUp);
  track.addEventListener("pointercancel", onPointerUp);
  track.addEventListener("pointerleave", onPointerUp);

  applyPosition(true);
}

function buildSupportMailto(payload, formLocale) {
  const subjectPrefix = formLocale.subjectPrefix || "Support Inquiry from";
  const bodyNameLabel = formLocale.bodyNameLabel || "Name";
  const bodyEmailLabel = formLocale.bodyEmailLabel || "Email";
  const bodyMessageLabel = formLocale.bodyMessageLabel || "Message";
  const subject = `${subjectPrefix} ${payload.name}`.trim();
  const body =
    `${bodyNameLabel}: ${payload.name}\n` +
    `${bodyEmailLabel}: ${payload.email}\n\n` +
    `${bodyMessageLabel}:\n${payload.message}`;

  return `mailto:${SUPPORT_RECIPIENT}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function sendSupportViaMailto(payload, formLocale) {
  const mailtoUrl = buildSupportMailto(payload, formLocale);
  window.location.assign(mailtoUrl);
}

function submitSupportRequest(payload, formLocale, options = {}) {
  const transport = options.transport || sendSupportViaMailto;
  return transport(payload, formLocale);
}

function bindSupportForm() {
  const form = document.querySelector("[data-support-form]");
  if (!form) return;

  const nameInput = form.querySelector('[data-support-input="name"]');
  const emailInput = form.querySelector('[data-support-input="email"]');
  const messageInput = form.querySelector('[data-support-input="message"]');
  const sendButton = form.querySelector("[data-support-send]");

  if (!nameInput || !emailInput || !messageInput || !sendButton) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const payload = {
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      message: messageInput.value.trim(),
    };

    const formLocale = deepGet(window.__BLEN_LOCALE__ || {}, "support.form") || {};
    const requiredAlert =
      formLocale.requiredAlert || "Please fill in all fields before sending.";

    if (!payload.name || !payload.email || !payload.message) {
      alert(requiredAlert);
      return;
    }

    submitSupportRequest(payload, formLocale);
  });
}

async function init() {
  const currentLang = getCurrentLang();
  const savedLang = getSavedLang();
  const page = getCurrentPage();

  if (savedLang !== currentLang) {
    location.replace(localeUrl(savedLang, page));
    return;
  }

  try {
    window.__BLEN_LOCALE__ = await loadLocale(currentLang);
  } catch (err) {
    if (currentLang !== "en") {
      window.__BLEN_LOCALE__ = await loadLocale("en");
    } else {
      throw err;
    }
  }

  applyI18n(currentLang);
  initializeLanguageSelector();
  setActiveLangButton(currentLang);
  bindHeaderNav();
  initFeatureCarousel();
  bindStoreLinks();
  bindSupportForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
