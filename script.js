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
  document.querySelectorAll(".site-lang__btn").forEach((btn) => {
    const active = btn.dataset.setLang === lang;
    btn.classList.toggle("site-lang__btn--active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
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

function bindLangToggle() {
  document.querySelectorAll(".site-lang__btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetLang = btn.dataset.setLang;
      if (!SUPPORTED_LANGS.includes(targetLang)) return;
      setSavedLang(targetLang);
      const nextUrl = localeUrl(targetLang, getCurrentPage());
      if (nextUrl !== location.pathname) {
        location.href = nextUrl;
      }
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
  setActiveLangButton(currentLang);
  bindHeaderNav();
  bindLangToggle();
  bindStoreLinks();
  bindSupportForm();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
