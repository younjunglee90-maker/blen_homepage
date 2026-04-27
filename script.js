const ANDROID_URL = "#";
const IOS_URL = "#";
const SUPPORT_RECIPIENT = "hello@blenmatch.com";

const LANG_KEY = "blen-lang";
const SUPPORTED_LANGS = ["en", "ko"];
const PAGE_KEYS = ["home", "about", "terms", "privacy", "support", "relationshipTest", "aiChat", "report", "login"];

const PAGE_PATHS = {
  home: "",
  about: "about",
  terms: "terms",
  privacy: "privacy",
  support: "support",
  relationshipTest: "relationship-test",
  aiChat: "ai-chat",
  report: "report",
  login: "login",
};

const ANALYSIS_STORAGE_KEY = "blen_report";
const LEGACY_ANALYSIS_STORAGE_KEY = "blen-analysis-result";
const PENDING_ANALYSIS_MESSAGES_KEY = "blen_pending_analysis_messages";
const PENDING_ANALYSIS_OVERLAY_KEY = "blen_pending_analysis_overlay";
const ANALYSIS_SCHEMA_VERSION_KEY = "blen_report_schema_version";
const ANALYSIS_SCHEMA_VERSION = "2026-04-27-story-v2";
const AUTH_SESSION_KEY = "blen_auth_session";
const PENDING_REPORT_SAVE_KEY = "blen_pending_report_save";
const POST_LOGIN_REDIRECT_KEY = "blen_post_login_redirect";
let supabaseClientPromise = null;

function getSupabaseAccessTokenFromStorage() {
  try {
    const ownSessionRaw = localStorage.getItem(AUTH_SESSION_KEY);
    if (ownSessionRaw) {
      const ownSession = JSON.parse(ownSessionRaw);
      if (ownSession?.access_token) return ownSession.access_token;
    }
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("sb-") || !key.endsWith("-auth-token")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (parsed?.access_token) return parsed.access_token;
      if (Array.isArray(parsed) && parsed[0]?.access_token) return parsed[0].access_token;
      if (parsed?.currentSession?.access_token) return parsed.currentSession.access_token;
    }
  } catch (_) {
    return null;
  }
  return null;
}

async function getSupabaseClient() {
  if (supabaseClientPromise) return supabaseClientPromise;
  supabaseClientPromise = (async () => {
    if (!window.supabase || typeof window.supabase.createClient !== "function") return null;
    const response = await fetch("/api/supabase-config");
    if (!response.ok) return null;
    const config = await response.json();
    if (!config?.url || !config?.anonKey) return null;
    return window.supabase.createClient(config.url, config.anonKey);
  })();
  return supabaseClientPromise;
}

async function getLoggedInSupabaseUser() {
  const supabase = await getSupabaseClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data?.user || null;
}

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

function parseUrlParams() {
  return new URLSearchParams(window.location.search || "");
}

function getRedirectFromUrlOrStorage(defaultPath) {
  const params = parseUrlParams();
  const fromQuery = params.get("redirect");
  if (fromQuery) {
    localStorage.setItem(POST_LOGIN_REDIRECT_KEY, fromQuery);
    return fromQuery;
  }
  const stored = localStorage.getItem(POST_LOGIN_REDIRECT_KEY);
  return stored || defaultPath;
}

function consumeStoredRedirect(defaultPath) {
  const target = localStorage.getItem(POST_LOGIN_REDIRECT_KEY) || defaultPath;
  localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
  return target;
}

function toAbsoluteUrl(pathOrUrl) {
  if (!pathOrUrl) return window.location.origin;
  try {
    return new URL(pathOrUrl, window.location.origin).toString();
  } catch (_) {
    return window.location.origin;
  }
}

function createLocalReportShareId() {
  return `r_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function setActiveLangButton(lang) {
  let currentLabel = "";
  document.querySelectorAll(".site-lang__btn").forEach((btn) => {
    const active = btn.dataset.setLang === lang;
    btn.classList.toggle("site-lang__btn--active", active);
    btn.setAttribute("aria-pressed", active ? "true" : "false");
    btn.setAttribute("aria-checked", active ? "true" : "false");
    if (active) currentLabel = btn.textContent.trim();
  });

  const currentLangLabel = document.querySelector("[data-lang-current]");
  if (currentLangLabel) {
    currentLangLabel.textContent =
      currentLabel || (lang === "ko" ? "한국어" : "English");
  }
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
    relationshipTest: "meta.titleRelationshipTest",
    aiChat: "meta.titleAiChat",
    report: "meta.titleReport",
    login: "meta.titleLogin",
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
      closeLangDropdown();
      setSavedLang(targetLang);
      const nextUrl = localeUrl(targetLang, getCurrentPage());
      if (nextUrl !== location.pathname) {
        location.href = nextUrl;
      }
    });
  });
}

function closeLangDropdown() {
  const langMenu = document.querySelector(".site-lang");
  const trigger = document.querySelector(".site-lang__trigger");
  if (!langMenu || !trigger) return;
  langMenu.classList.remove("is-open");
  trigger.setAttribute("aria-expanded", "false");
}

function bindLangDropdown() {
  const langMenu = document.querySelector(".site-lang");
  const trigger = document.querySelector(".site-lang__trigger");
  if (!langMenu || !trigger) return;

  trigger.addEventListener("click", (event) => {
    event.stopPropagation();
    const open = langMenu.classList.toggle("is-open");
    trigger.setAttribute("aria-expanded", open ? "true" : "false");
  });

  langMenu.querySelectorAll(".site-lang__btn").forEach((btn) => {
    btn.addEventListener("click", closeLangDropdown);
  });

  document.addEventListener("click", (event) => {
    if (!langMenu.contains(event.target)) closeLangDropdown();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLangDropdown();
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
        closeLangDropdown();
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

function bindPreviewCarousel() {
  const track = document.querySelector(".app-preview__track");
  const dotsWrap = document.querySelector(".app-preview__dots");
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.querySelectorAll(".app-preview__slide"));
  if (!slides.length) return;

  dotsWrap.innerHTML = "";
  const dots = slides.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "app-preview__dot";
    dot.setAttribute("role", "tab");
    dot.setAttribute("aria-label", `Go to preview ${index + 1}`);
    dot.setAttribute("aria-selected", "false");
    dot.addEventListener("click", () => {
      track.scrollTo({
        left: track.clientWidth * index,
        behavior: "smooth",
      });
    });
    dotsWrap.appendChild(dot);
    return dot;
  });

  function setActive(index) {
    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === index;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-selected", active ? "true" : "false");
    });
  }

  function updateActiveFromScroll() {
    const slideWidth = track.clientWidth || 1;
    const index = Math.round(track.scrollLeft / slideWidth);
    const safeIndex = Math.max(0, Math.min(index, slides.length - 1));
    setActive(safeIndex);
  }

  setActive(0);

  let scrollTimer = null;
  track.addEventListener("scroll", () => {
    if (scrollTimer) window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(updateActiveFromScroll, 60);
  });

  window.addEventListener("resize", updateActiveFromScroll);
}

function bindPreviewCTA() {
  const ctaButton = document.querySelector("[data-scroll-to-download]");
  if (!ctaButton) return;

  ctaButton.addEventListener("click", () => {
    const currentLang = getCurrentLang();
    location.href = localeUrl(currentLang, "relationshipTest");
  });
}

function bindRelationshipTestCTA() {
  const startButton = document.querySelector("[data-go-ai-chat]");
  if (!startButton) return;

  startButton.addEventListener("click", () => {
    const currentLang = getCurrentLang();
    location.href = localeUrl(currentLang, "aiChat");
  });
}

function renderChatBubble(messagesEl, text, role) {
  const currentLang = getCurrentLang();
  const formatTime = () =>
    new Date().toLocaleTimeString(currentLang === "ko" ? "ko-KR" : "en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: currentLang !== "ko",
    });

  const row = document.createElement("article");
  row.className = `ai-chat__row ai-chat__row--${role}`;

  const avatar = document.createElement("span");
  avatar.className = `ai-chat__avatar ai-chat__avatar--${role}`;
  avatar.setAttribute("aria-hidden", "true");
  if (role === "ai") {
    avatar.innerHTML =
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20.2c-.27 0-.53-.1-.73-.28-1.4-1.26-2.62-2.35-3.67-3.3-3.08-2.78-5.12-4.62-5.12-7.45 0-2.32 1.8-4.12 4.13-4.12 1.44 0 2.82.68 3.7 1.82.88-1.14 2.26-1.82 3.7-1.82 2.33 0 4.13 1.8 4.13 4.12 0 2.83-2.04 4.67-5.12 7.45-1.05.95-2.27 2.04-3.67 3.3-.2.18-.46.28-.73.28Z" fill="currentColor"/></svg>';
  } else {
    avatar.textContent = "◌";
  }

  const bubble = document.createElement("div");
  bubble.className = `ai-chat__bubble ai-chat__bubble--${role}`;

  const block = document.createElement("div");
  block.className = "ai-chat__message-block";

  const meta = document.createElement("div");
  meta.className = "ai-chat__meta";

  const timestamp = document.createElement("time");
  timestamp.className = "ai-chat__time";
  timestamp.textContent = formatTime();
  meta.appendChild(timestamp);

  if (role === "user") {
    const check = document.createElement("span");
    check.className = "ai-chat__check";
    check.setAttribute("aria-hidden", "true");
    check.textContent = "✓";
    meta.appendChild(check);
  }

  const content = document.createElement("p");
  content.className = "ai-chat__text";
  content.textContent = text;

  bubble.appendChild(content);
  block.appendChild(bubble);
  block.appendChild(meta);
  row.appendChild(avatar);
  row.appendChild(block);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  window.requestAnimationFrame(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

function renderTypingBubble(messagesEl) {
  const currentLang = getCurrentLang();
  const typingTime = new Date().toLocaleTimeString(currentLang === "ko" ? "ko-KR" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: currentLang !== "ko",
  });

  const row = document.createElement("article");
  row.className = "ai-chat__row ai-chat__row--ai";
  row.setAttribute("data-typing-bubble", "true");

  const avatar = document.createElement("span");
  avatar.className = "ai-chat__avatar ai-chat__avatar--ai";
  avatar.setAttribute("aria-hidden", "true");
  avatar.innerHTML =
    '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 20.2c-.27 0-.53-.1-.73-.28-1.4-1.26-2.62-2.35-3.67-3.3-3.08-2.78-5.12-4.62-5.12-7.45 0-2.32 1.8-4.12 4.13-4.12 1.44 0 2.82.68 3.7 1.82.88-1.14 2.26-1.82 3.7-1.82 2.33 0 4.13 1.8 4.13 4.12 0 2.83-2.04 4.67-5.12 7.45-1.05.95-2.27 2.04-3.67 3.3-.2.18-.46.28-.73.28Z" fill="currentColor"/></svg>';

  const bubble = document.createElement("div");
  bubble.className = "ai-chat__bubble ai-chat__bubble--ai";
  bubble.innerHTML =
    '<span class="ai-chat__typing"><span class="ai-chat__typing-dot"></span><span class="ai-chat__typing-dot"></span><span class="ai-chat__typing-dot"></span></span>';

  const block = document.createElement("div");
  block.className = "ai-chat__message-block";

  const meta = document.createElement("div");
  meta.className = "ai-chat__meta";
  meta.innerHTML = `<time class="ai-chat__time">${typingTime}</time>`;

  row.appendChild(avatar);
  block.appendChild(bubble);
  block.appendChild(meta);
  row.appendChild(block);
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
  window.requestAnimationFrame(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
  return row;
}

function bindAiChatFlow() {
  const chatRoot = document.querySelector(".ai-chat");
  const messagesEl = chatRoot ? chatRoot.querySelector(".ai-chat__messages") : null;
  const form = chatRoot ? chatRoot.querySelector(".ai-chat__input-wrap") : null;
  const input = form ? form.querySelector(".ai-chat__input") : null;
  if (!chatRoot || !messagesEl || !form || !input) return;

  const firstMessage = deepGet(window.__BLEN_LOCALE__, "aiChat.firstMessage");
  const guidanceMessage = deepGet(window.__BLEN_LOCALE__, "aiChat.guidanceMessage");
  const totalQuestions = 25;

  const headerEl = chatRoot.querySelector(".ai-chat__header");
  const progressEl = document.createElement("section");
  progressEl.className = "ai-chat__progress";
  progressEl.hidden = true;
  progressEl.innerHTML = `
    <div class="ai-chat__progress-head">
      <span class="ai-chat__progress-label">${
        deepGet(window.__BLEN_LOCALE__, "aiChat.progressLabel") || "분석 진행률"
      }</span>
      <span class="ai-chat__progress-value" data-progress-value>0%</span>
    </div>
    <div class="ai-chat__progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
      <span class="ai-chat__progress-fill" data-progress-fill></span>
    </div>
  `;
  if (headerEl && headerEl.nextSibling) {
    chatRoot.insertBefore(progressEl, headerEl.nextSibling);
  } else if (headerEl) {
    chatRoot.appendChild(progressEl);
  }
  const progressValueEl = progressEl.querySelector("[data-progress-value]");
  const progressFillEl = progressEl.querySelector("[data-progress-fill]");
  const progressTrackEl = progressEl.querySelector(".ai-chat__progress-track");

  function updateProgress(forceComplete = false) {
    const percent = forceComplete
      ? 100
      : Math.max(0, Math.min(99, Math.round((userTurnCount / totalQuestions) * 100)));
    if (progressValueEl) progressValueEl.textContent = `${percent}%`;
    if (progressFillEl) progressFillEl.style.width = `${percent}%`;
    if (progressTrackEl) progressTrackEl.setAttribute("aria-valuenow", String(percent));
  }

  let userTurnCount = 0;
  let currentQuestionIndex = 0;
  let isWaitingForFinalAnswer = false;
  let analysisRequested = false;
  let isRequesting = false;
  let hasSentGuidanceMessage = false;
  const conversationHistory = [];
  const sendButton = form.querySelector(".ai-chat__send");
  const sendLabel = sendButton ? sendButton.textContent : "";

  renderChatBubble(messagesEl, firstMessage, "ai");
  conversationHistory.push({ role: "assistant", content: firstMessage });

  async function requestAIReply() {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory, language: getCurrentLang() }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "Failed to get AI response");
    }
    const data = await response.json();
    return data.reply;
  }

  async function requestAnalysisFromChat(messages) {
    console.log("[Blen][analysis] API start", { messageCount: Array.isArray(messages) ? messages.length : 0 });
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, language: getCurrentLang() }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const error = new Error(payload.error || "Failed to analyze conversation");
      error.status = response.status;
      throw error;
    }
    const data = await response.json();
    console.log("[Blen][analysis] API returned");
    console.log("[Blen][analysis] response JSON", data);
    return data;
  }

  function getAnalysisErrorMessage(error, lang) {
    const message = String(error?.message || "").toLowerCase();
    const status = Number(error?.status || 0);
    const isKo = lang === "ko";
    if (message.includes("abort") || message.includes("timeout")) {
      return isKo
        ? "분석 시간이 조금 길어지고 있어. 네트워크를 확인한 뒤 마지막 답변을 한 번만 다시 보내줘."
        : "Analysis is taking longer than expected. Check your network and send your last answer once more.";
    }
    if (status >= 500) {
      return isKo
        ? "지금 분석 서버가 잠시 바쁜 상태야. 10초 뒤 마지막 답변을 다시 보내주면 바로 이어서 분석할게."
        : "The analysis server is busy right now. Try sending your last answer again in about 10 seconds.";
    }
    if (status >= 400) {
      return isKo
        ? "분석 요청 형식에 문제가 있었어. 마지막 답변을 다시 보내주면 다시 시도할게."
        : "There was a format issue in the analysis request. Send your last answer once more to retry.";
    }
    return isKo
      ? "분석을 불러오는 중 문제가 생겼어. 마지막 답변을 한 번만 다시 보내주면 바로 이어서 분석할게."
      : "There was a problem loading your analysis. Send your last answer once more and I will analyze it right away.";
  }

  async function completeAfterFinalAnswer() {
    if (analysisRequested) return;
    analysisRequested = true;

    try {
      const responseData = await requestAnalysisFromChat(conversationHistory);
      const analysis =
        responseData?.analysis && typeof responseData.analysis === "object"
          ? responseData.analysis
          : responseData;
      if (!analysis || typeof analysis !== "object") {
        throw new Error("Analysis JSON is missing");
      }

      localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(analysis));
      localStorage.setItem(ANALYSIS_SCHEMA_VERSION_KEY, ANALYSIS_SCHEMA_VERSION);
      localStorage.removeItem(LEGACY_ANALYSIS_STORAGE_KEY);
      localStorage.removeItem(PENDING_ANALYSIS_MESSAGES_KEY);
      localStorage.removeItem(PENDING_ANALYSIS_OVERLAY_KEY);
      console.log("[Blen][analysis] saved to localStorage", {
        key: ANALYSIS_STORAGE_KEY,
        schema: ANALYSIS_SCHEMA_VERSION,
      });

      updateProgress(true);
      const reportPath = localeUrl(getCurrentLang(), "report");
      window.setTimeout(() => {
        location.href = reportPath;
      }, 80);
    } catch (error) {
      analysisRequested = false;
      isWaitingForFinalAnswer = true;
      renderChatBubble(
        messagesEl,
        getAnalysisErrorMessage(error, getCurrentLang()),
        "ai"
      );
      console.log("[Blen][analysis] API error", error);
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (isRequesting || analysisRequested) return;
    const raw = input.value.trim();
    if (!raw) return;

    renderChatBubble(messagesEl, raw, "user");
    input.value = "";
    conversationHistory.push({ role: "user", content: raw });
    userTurnCount += 1;
    if (progressEl.hidden) progressEl.hidden = false;
    updateProgress(false);

    if (!hasSentGuidanceMessage && guidanceMessage) {
      hasSentGuidanceMessage = true;
      renderChatBubble(messagesEl, guidanceMessage, "ai");
      conversationHistory.push({ role: "assistant", content: guidanceMessage });
    }

    if (isWaitingForFinalAnswer) {
      isWaitingForFinalAnswer = false;
      await completeAfterFinalAnswer();
      return;
    }

    let typingBubble = null;
    try {
      isRequesting = true;
      if (sendButton) {
        sendButton.disabled = true;
        sendButton.textContent = "...";
      }
      typingBubble = renderTypingBubble(messagesEl);
      const reply = await requestAIReply();
      if (typingBubble) typingBubble.remove();
      renderChatBubble(messagesEl, reply, "ai");
      conversationHistory.push({ role: "assistant", content: reply });
      if (currentQuestionIndex < totalQuestions - 1) {
        currentQuestionIndex += 1;
        if (currentQuestionIndex === totalQuestions - 1) {
          isWaitingForFinalAnswer = true;
        }
      }
    } catch (error) {
      if (typingBubble) typingBubble.remove();
      renderChatBubble(
        messagesEl,
        "잠깐만, 지금 연결이 살짝 불안정해. 다시 한 번 말해줄래?",
        "ai"
      );
    } finally {
      isRequesting = false;
      if (sendButton) {
        sendButton.disabled = false;
        sendButton.textContent = sendLabel || deepGet(window.__BLEN_LOCALE__, "aiChat.send") || "Send";
      }
    }
  });
}

function bindLoginPage() {
  if (getCurrentPage() !== "login") return;
  const form = document.querySelector("[data-login-form]");
  const googleButton = document.querySelector("[data-login-google]");
  if (!form) return;
  const emailInput = form.querySelector('[data-login-input="email"]');
  const submitButton = form.querySelector("[data-login-submit]");
  const statusText = form.querySelector("[data-login-status]");
  if (!emailInput || !submitButton || !statusText) return;

  const currentLang = getCurrentLang();
  const defaultRedirect = localeUrl(currentLang, "report");
  const redirectTarget = getRedirectFromUrlOrStorage(defaultRedirect);

  async function finalizeAfterLogin(supabase) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return false;
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData?.session) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(sessionData.session));
    }
    const hasPendingReport = localStorage.getItem(PENDING_REPORT_SAVE_KEY) === "1";
    const reportRaw =
      localStorage.getItem(ANALYSIS_STORAGE_KEY) ||
      localStorage.getItem(LEGACY_ANALYSIS_STORAGE_KEY);
    const reportAnalysis = reportRaw ? JSON.parse(reportRaw) : null;

    if (hasPendingReport && reportAnalysis) {
      await supabase.from("relationship_reports").insert({
        user_id: user.id,
        analysis_json: reportAnalysis,
      });
      localStorage.removeItem(PENDING_REPORT_SAVE_KEY);
      localStorage.removeItem(PENDING_ANALYSIS_MESSAGES_KEY);
    }

    const finalPath = consumeStoredRedirect(redirectTarget);
    location.href = finalPath;
    return true;
  }

  (async () => {
    const supabase = await getSupabaseClient();
    if (!supabase) return;
    const params = parseUrlParams();
    if (params.get("auth_callback") === "1") {
      submitButton.disabled = true;
      statusText.textContent =
        deepGet(window.__BLEN_LOCALE__, "login.callbackLoading") ||
        "Completing login...";
      const done = await finalizeAfterLogin(supabase);
      if (!done) {
        submitButton.disabled = false;
        statusText.textContent =
          deepGet(window.__BLEN_LOCALE__, "login.error") || "Login failed. Try again.";
      }
      return;
    }
    const { data: existingSession } = await supabase.auth.getSession();
    if (existingSession?.session) {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(existingSession.session));
    }
  })();

  if (googleButton) {
    googleButton.addEventListener("click", async () => {
      submitButton.disabled = true;
      googleButton.disabled = true;
      statusText.textContent = deepGet(window.__BLEN_LOCALE__, "login.loading") || "Loading...";
      try {
        const supabase = await getSupabaseClient();
        if (!supabase) throw new Error("Supabase client unavailable");
        localStorage.setItem(POST_LOGIN_REDIRECT_KEY, redirectTarget);
        const callbackPath = localeUrl(currentLang, "login");
        const redirectTo = toAbsoluteUrl(
          `${callbackPath}?auth_callback=1&redirect=${encodeURIComponent(redirectTarget)}`
        );
        const { error } = await supabase.auth.signInWithOAuth({
          provider: "google",
          options: { redirectTo },
        });
        if (error) throw error;
      } catch (_) {
        statusText.textContent =
          deepGet(window.__BLEN_LOCALE__, "login.error") || "Login failed. Try again.";
        submitButton.disabled = false;
        googleButton.disabled = false;
      }
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;

    submitButton.disabled = true;
    statusText.textContent = deepGet(window.__BLEN_LOCALE__, "login.loading") || "Loading...";

    try {
      const supabase = await getSupabaseClient();
      if (!supabase) throw new Error("Supabase client unavailable");
      localStorage.setItem(POST_LOGIN_REDIRECT_KEY, redirectTarget);
      const callbackPath = localeUrl(currentLang, "login");
      const emailRedirectTo = toAbsoluteUrl(
        `${callbackPath}?auth_callback=1&redirect=${encodeURIComponent(redirectTarget)}`
      );
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo },
      });
      if (error) throw new Error(error.message || "Login failed");
      statusText.textContent =
        deepGet(window.__BLEN_LOCALE__, "login.magicSent") ||
        "Check your email for the magic link.";
      submitButton.disabled = false;
    } catch (error) {
      statusText.textContent =
        deepGet(window.__BLEN_LOCALE__, "login.error") || "Login failed. Try again.";
      submitButton.disabled = false;
    }
  });
}

function bindReportPage() {
  const reportRoot = document.querySelector(".report");
  if (!reportRoot) return;

  const deriveReportInputs = (analysis) => {
    if (analysis?.report_inputs) return analysis.report_inputs;

    const summary = analysis?.summary || {};
    const coreValuesTop = Array.isArray(analysis?.core_values?.top_values)
      ? analysis.core_values.top_values
      : [];
    const inferredCoreValues = [
      analysis?.core_values?.money_values?.primary,
      analysis?.core_values?.family_values?.primary,
      analysis?.core_values?.work_life_balance?.primary,
      analysis?.core_values?.children_preference?.type,
    ].filter((value) => typeof value === "string" && value.trim().length > 0);
    const strengths = Array.isArray(summary?.strengths) ? summary.strengths : [];
    const challenges = Array.isArray(summary?.possible_challenges)
      ? summary.possible_challenges
      : [];
    const bestMatchTraits = Array.isArray(summary?.best_match_traits)
      ? summary.best_match_traits
      : [];
    const styleType = analysis?.relationship_style?.type || "관계 탐색형";
    const styleSummary = analysis?.relationship_style?.summary || "";
    const oneLine = summary?.one_sentence_summary || "";
    const challengeLine = challenges[0] || "";

    return {
      headline_keyword: summary?.relationship_style_title || styleType || "",
      relationship_style:
        styleSummary ||
        `너는 연애에서 ${styleType}에 가까운 흐름을 보이고, 상황에 따라 태도를 유연하게 조절하는 편이야.`,
      core_values:
        coreValuesTop.length
          ? coreValuesTop
          : inferredCoreValues.length
            ? inferredCoreValues
            : [],
      attraction_pattern:
        analysis?.attraction_pattern?.primary
          ? `${analysis.attraction_pattern.primary} 성향이 끌림의 핵심으로 보이고, 반복되는 감정 패턴도 함께 나타나는 편이야.`
          : "",
      communication_style:
        analysis?.communication?.primary
          ? `감정 대화에서는 ${analysis.communication.primary} 쪽 반응이 두드러지고, 갈등 상황에서 말의 톤과 타이밍을 조절하는 경향이 있어.`
          : "",
      emotional_pattern:
        analysis?.attachment_style?.primary
          ? `관계가 깊어질수록 ${analysis.attachment_style.primary} 성향이 드러나고, 연락/반응 변화에 감정 속도가 달라지는 편이야.`
          : "",
      dealbreakers: challenges.length ? challenges : [],
      strengths: strengths.length ? strengths : [],
      risks: challenges.length ? challenges : [],
      ideal_partner_traits: bestMatchTraits.length
        ? bestMatchTraits
        : [],
      one_line_summary: oneLine || "",
      dating_advice:
        challengeLine ||
        "",
    };
  };

  const setFromAnalysis = (analysis) => {
    const report = deriveReportInputs(analysis);
    const setText = (selector, value) => {
      const el = reportRoot.querySelector(selector);
      if (el) el.textContent = value;
    };
    const setList = (selector, items) => {
      const el = reportRoot.querySelector(selector);
      if (!el) return;
      el.innerHTML = "";
      items.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        el.appendChild(li);
      });
    };

    setText("[data-report-headline]", report.headline_keyword || "");
    setText("[data-report-relationship-style]", report.relationship_style || "");
    setList("[data-report-core-values]", report.core_values || []);
    setText("[data-report-attraction-pattern]", report.attraction_pattern || "");
    setText("[data-report-communication-style]", report.communication_style || "");
    setText("[data-report-emotional-pattern]", report.emotional_pattern || "");
    setList("[data-report-dealbreakers]", report.dealbreakers || []);
    setText("[data-report-strength]", (report.strengths || []).join(" "));
    setText("[data-report-risk]", (report.risks || []).join(" "));
    setText("[data-report-ideal-partner]", (report.ideal_partner_traits || []).join(", "));
    setText("[data-report-one-line]", report.one_line_summary || "");
    setText("[data-report-advice]", report.dating_advice || "");
    const firstItem = (arr) =>
      Array.isArray(arr) && arr.length && typeof arr[0] === "string" ? arr[0] : "";
    setText("[data-report-card-style]", report.relationship_style || "");
    setText("[data-report-card-strength]", firstItem(report.strengths) || "");
    setText("[data-report-card-challenge]", firstItem(report.risks) || firstItem(report.dealbreakers) || "");
    setText("[data-report-card-bestmatch]", firstItem(report.ideal_partner_traits) || "");
    const setTag = (selector, value) => {
      const el = reportRoot.querySelector(selector);
      if (el) el.textContent = value;
    };
    const setBar = (selector, percent) => {
      const el = reportRoot.querySelector(selector);
      if (!el) return;
      const safe = Number.isFinite(percent) ? Math.max(12, Math.min(96, percent)) : 44;
      el.style.width = `${safe}%`;
    };
    const scoreToPercent = (raw, fallbackPercent = 48) => {
      if (typeof raw !== "number" || Number.isNaN(raw)) return fallbackPercent;
      const normalized = raw <= 1 ? raw * 5 : raw;
      return Math.round((Math.max(1, Math.min(5, normalized)) / 5) * 100);
    };
    const pickPrimaryScore = (scores, key, fallback = 2.8) => {
      if (!scores || typeof scores !== "object") return fallback;
      const raw = scores[key];
      return typeof raw === "number" ? raw : fallback;
    };
    const isKo = getCurrentLang() === "ko";

    const conflictPrimary =
      analysis?.conflict_style?.primary ||
      analysis?.conflict_style?.primary_conflict_style ||
      "resolution_oriented";
    const attachmentPrimary =
      analysis?.attachment_style?.primary ||
      analysis?.attachment?.primary_attachment ||
      "secure";
    const communicationPrimary =
      analysis?.communication?.primary ||
      "direct_open";
    const boundaryPrimary =
      analysis?.boundaries?.primary ||
      "moderate_boundary";

    const conflictLabelMap = isKo
      ? {
          resolution_oriented: "갈등이 생기면 대화로 풀고 관계를 회복하려는 편이야.",
          avoidant: "감정이 올라오면 잠깐 거리를 두고 정리하려는 경향이 있어.",
          defensive: "상처받지 않으려 먼저 방어적으로 반응할 때가 있어.",
          aggressive: "답답함이 쌓이면 말이 강해질 수 있어서 톤 조절이 중요해.",
          mixed: "상황에 따라 회피와 대화 시도가 번갈아 나오는 편이야.",
        }
      : {
          resolution_oriented: "You try to solve conflict through conversation and repair.",
          avoidant: "When emotions rise, you tend to pause and take space first.",
          defensive: "You can become self-protective when you feel misunderstood.",
          aggressive: "When frustration builds, your tone can become sharper.",
          mixed: "Your conflict approach changes depending on the situation.",
        };
    const attachmentLabelMap = isKo
      ? {
          secure: "관계가 깊어져도 비교적 안정적으로 감정을 표현하는 편이야.",
          anxious: "상대 반응의 온도에 예민해서 확신이 필요할 때가 많아.",
          avoidant: "가까워질수록 혼자 정리할 시간이 필요해지는 패턴이 있어.",
          mixed: "가까워지고 싶다가도 동시에 거리도 필요해지는 흐름이 보여.",
        }
      : {
          secure: "You stay emotionally steady even as intimacy grows.",
          anxious: "You are sensitive to response changes and need reassurance.",
          avoidant: "As closeness deepens, you need more space to regulate.",
          mixed: "You want closeness but also need distance at times.",
        };
    const communicationLabelMap = isKo
      ? {
          direct_open: "마음을 비교적 솔직하게 말하며 오해를 줄이려는 편이야.",
          indirect: "직접 말하기보다 분위기와 뉘앙스로 신호를 주는 경향이 있어.",
          emotion_suppressing: "감정을 바로 꺼내기보다 안에서 오래 정리하는 편이야.",
          reactive_explosive: "감정이 쌓이면 한 번에 크게 표현될 수 있어.",
          mixed: "상황에 따라 직접표현과 참는 흐름이 함께 나타나.",
        }
      : {
          direct_open: "You usually express feelings clearly and early.",
          indirect: "You often communicate through tone and context first.",
          emotion_suppressing: "You tend to hold feelings in before sharing them.",
          reactive_explosive: "When emotions pile up, expression can come out strong.",
          mixed: "Your communication style shifts with context.",
        };
    const boundaryLabelMap = isKo
      ? {
          high_boundary: "관계에서도 나만의 리듬과 경계를 꽤 분명하게 지키는 편이야.",
          moderate_boundary: "함께하는 시간과 개인 시간을 균형 있게 맞추려는 타입이야.",
          low_boundary: "가까운 관계에서는 유연하게 맞춰주며 연결감을 더 중시해.",
        }
      : {
          high_boundary: "You keep clear personal boundaries even in close relationships.",
          moderate_boundary: "You aim for a healthy balance of closeness and space.",
          low_boundary: "You prioritize emotional closeness with flexible boundaries.",
        };

    setText("[data-report-mini-conflict]", conflictLabelMap[conflictPrimary] || conflictLabelMap.resolution_oriented);
    setText("[data-report-mini-attachment]", attachmentLabelMap[attachmentPrimary] || attachmentLabelMap.secure);
    setText("[data-report-mini-communication]", communicationLabelMap[communicationPrimary] || communicationLabelMap.direct_open);
    setText("[data-report-mini-boundaries]", boundaryLabelMap[boundaryPrimary] || boundaryLabelMap.moderate_boundary);

    const conflictScore = pickPrimaryScore(analysis?.conflict_style?.scores, conflictPrimary, 3.2);
    const attachmentScore = pickPrimaryScore(analysis?.attachment_style?.scores, attachmentPrimary, 3.1);
    const communicationScore = pickPrimaryScore(analysis?.communication?.scores, communicationPrimary, 3.0);
    const boundaryScore =
      typeof analysis?.boundaries?.alone_time_need === "number"
        ? analysis.boundaries.alone_time_need
        : 3.0;
    setBar("[data-report-mini-conflict-bar]", scoreToPercent(conflictScore, 56));
    setBar("[data-report-mini-attachment-bar]", scoreToPercent(attachmentScore, 54));
    setBar("[data-report-mini-communication-bar]", scoreToPercent(communicationScore, 52));
    setBar("[data-report-mini-boundaries-bar]", scoreToPercent(boundaryScore, 50));

    const storyLove = isKo
      ? `너는 ${report.relationship_style || "관계를 천천히 쌓아가는 타입"}에 가깝고, 마음이 열리기 전까지는 신중하게 사람을 보는 편이야.`
      : `You tend to ${report.relationship_style || "build love slowly"}, and you open up with care instead of rushing.`;
    const storySafe = isKo
      ? `특히 ${firstItem(report.core_values) || "신뢰"} 같은 기준이 지켜질 때 가장 편안함을 느끼고, 관계 안에서 진짜 너다운 모습이 더 잘 나와.`
      : `You feel safest when values like ${firstItem(report.core_values) || "trust"} are consistent, and that is when your warm side shines most.`;
    const storyHurt = isKo
      ? `${firstItem(report.risks) || "애매한 신호가 이어질 때"} 마음이 빨리 지칠 수 있어서, 초반에 기준을 맞추는 대화가 특히 중요해.`
      : `When ${firstItem(report.risks) || "signals feel unclear for too long"}, your energy can drain fast, so early clarity really helps.`;
    const storyMatch = isKo
      ? `너랑 잘 맞는 사람은 ${firstItem(report.ideal_partner_traits) || "감정적으로 안정적인 사람"}처럼 말과 행동이 일관되고, 서로의 감정을 존중해주는 사람이야.`
      : `Your best match is someone like ${firstItem(report.ideal_partner_traits) || "an emotionally steady partner"} who is consistent in both words and actions.`;
    setText("[data-report-story-love]", storyLove);
    setText("[data-report-story-safe]", storySafe);
    setText("[data-report-story-hurt]", storyHurt);
    setText("[data-report-story-match]", storyMatch);

    const analysisTags = Array.isArray(analysis?.tags)
      ? analysis.tags.filter((tag) => typeof tag === "string" && tag.trim().length > 0)
      : [];
    if (analysisTags.length) {
      setTag("[data-report-tag1]", analysisTags[0] || "");
      setTag("[data-report-tag2]", analysisTags[1] || "");
      setTag("[data-report-tag3]", analysisTags[2] || "");
      return;
    }
    const goalTagMap = isKo
      ? {
          marriage: "안정지향",
          serious: "진심중심",
          casual: "자유선호",
          unclear: "균형탐색",
        }
      : {
          marriage: "Stable-minded",
          serious: "Depth-first",
          casual: "Freedom-led",
          unclear: "Balanced",
        };
    const attachmentTag =
      analysis?.attachment?.anxious > analysis?.attachment?.avoidant
        ? isKo
          ? "감정중심"
          : "Emotion-led"
        : isKo
          ? "차분중심"
          : "Calm-led";
    const trustTag =
      analysis?.values?.family_values === "important"
        ? isKo
          ? "신뢰중요"
          : "Trust-first"
        : isKo
          ? "자율존중"
          : "Autonomy-aware";
    const tag1 = goalTagMap[analysis?.values?.relationship_goal] || (isKo ? "안정지향" : "Stable-minded");
    setTag("[data-report-tag1]", tag1);
    setTag("[data-report-tag2]", attachmentTag);
    setTag("[data-report-tag3]", trustTag);
  };

  const setAnalyzingState = (active) => {
    reportRoot.classList.toggle("report--analyzing", active);
  };

  const playReportEntrance = (overlay, stopMessageRotation) => {
    reportRoot.classList.add("report--entrance-prep");
    if (overlay) overlay.classList.add("report__analyzing-overlay--exit");
    window.setTimeout(() => {
      if (overlay) {
        overlay.hidden = true;
        overlay.classList.remove("report__analyzing-overlay--exit");
      }
      if (typeof stopMessageRotation === "function") stopMessageRotation();
      window.requestAnimationFrame(() => {
        reportRoot.classList.add("report--entrance-run");
      });
      window.setTimeout(() => {
        reportRoot.classList.add("report--entrance-cta");
      }, 520);
      window.setTimeout(() => {
        reportRoot.classList.remove(
          "report--entrance-prep",
          "report--entrance-run",
          "report--entrance-cta"
        );
      }, 2200);
    }, 260);
  };

  const ensureAnalyzingOverlay = () => {
    let overlay = reportRoot.querySelector("[data-report-analyzing-overlay]");
    if (overlay) return overlay;
    overlay = document.createElement("div");
    overlay.className = "report__analyzing-overlay";
    overlay.setAttribute("data-report-analyzing-overlay", "true");
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="report__analyzing-modal" role="status" aria-live="polite">
        <p class="report__analyzing-title">${
          deepGet(window.__BLEN_LOCALE__, "report.analyzingTitle") ||
          "Analyzing your relationship style..."
        }</p>
        <p class="report__analyzing-subtitle" data-report-analyzing-message>${
          deepGet(window.__BLEN_LOCALE__, "report.analyzingSubtitle") ||
          "Building your personalized Blen report."
        }</p>
        <span class="report__analyzing-dots" aria-hidden="true"><span></span><span></span><span></span></span>
      </div>
    `;
    reportRoot.appendChild(overlay);
    return overlay;
  };

  const startAnalyzingOverlayMessages = () => {
    const overlay = ensureAnalyzingOverlay();
    const messageEl = overlay.querySelector("[data-report-analyzing-message]");
    if (!messageEl) return () => {};
    const messageList = deepGet(window.__BLEN_LOCALE__, "report.analyzingSteps");
    const messages = Array.isArray(messageList) && messageList.length
      ? messageList
      : [
          "Understanding your relationship patterns...",
          "Analyzing your emotional tendencies...",
          "Building your personalized report...",
        ];
    let index = 0;
    const intervalId = window.setInterval(() => {
      index = (index + 1) % messages.length;
      messageEl.textContent = messages[index];
    }, 1800);
    return () => window.clearInterval(intervalId);
  };

  const requestAnalysisForReport = async (messages) => {
    console.log("[Blen][analysis] API start (report)", {
      messageCount: Array.isArray(messages) ? messages.length : 0,
    });
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 25000);
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages, language: getCurrentLang() }),
      signal: controller.signal,
    }).finally(() => {
      window.clearTimeout(timeoutId);
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      const error = new Error(payload.error || "Failed to analyze conversation");
      error.status = response.status;
      throw error;
    }
    const data = await response.json();
    console.log("[Blen][analysis] API returned (report)");
    console.log("[Blen][analysis] response JSON (report)", data);
    const analysis =
      data?.analysis && typeof data.analysis === "object"
        ? data.analysis
        : data;
    if (!analysis || typeof analysis !== "object") {
      throw new Error("Analysis JSON is missing");
    }
    return analysis;
  };

  const parseShareIdFromLocation = () => {
    const params = new URLSearchParams(window.location.search || "");
    const fromQuery = params.get("id") || params.get("share");
    if (fromQuery) return fromQuery;
    const segments = location.pathname.split("/").filter(Boolean);
    const shareIndex = segments.indexOf("share");
    if (shareIndex !== -1 && segments[shareIndex + 1]) return segments[shareIndex + 1];
    return null;
  };

  const parseReportInputsFromText = (text) => {
    if (!text || typeof text !== "string") return null;
    try {
      const parsed = JSON.parse(text);
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (_) {
      return null;
    }
  };

  const toSharedAnalysis = (row) => {
    const reportInputsFromIdeal = row?.ideal_partner_json?.report_inputs;
    const reportInputsFromText = parseReportInputsFromText(row?.report_text);
    return {
      values: row?.values_json || {},
      attachment: row?.attachment_json || {},
      conflict_style: row?.conflict_json || {},
      personality: row?.personality_json || {},
      report_inputs: reportInputsFromIdeal || reportInputsFromText || null,
      confidence: {},
    };
  };

  const fetchSharedReportById = async (shareId) => {
    const supabase = await getSupabaseClient();
    if (!supabase || !shareId) return null;
    const { data, error } = await supabase
      .from("shared_reports")
      .select("*")
      .eq("share_id", shareId)
      .limit(1);
    if (error || !Array.isArray(data) || !data[0]) return null;
    return toSharedAnalysis(data[0]);
  };

  const buildSharePayload = (analysis, shareId) => {
    const reportInputs = deriveReportInputs(analysis);
    return {
      share_id: shareId,
      report_text: JSON.stringify(reportInputs),
      values_json: analysis?.values || {},
      attachment_json: analysis?.attachment || {},
      conflict_json: analysis?.conflict_style || {},
      personality_json: analysis?.personality || {},
      ideal_partner_json: {
        ideal_partner_traits: reportInputs.ideal_partner_traits || [],
        one_line_summary: reportInputs.one_line_summary || "",
        report_inputs: reportInputs,
      },
    };
  };

  const schemaVersion = localStorage.getItem(ANALYSIS_SCHEMA_VERSION_KEY);
  const isSchemaCurrent = schemaVersion === ANALYSIS_SCHEMA_VERSION;
  const raw = isSchemaCurrent
    ? localStorage.getItem(ANALYSIS_STORAGE_KEY) || localStorage.getItem(LEGACY_ANALYSIS_STORAGE_KEY)
    : null;
  if (!isSchemaCurrent) {
    localStorage.removeItem(ANALYSIS_STORAGE_KEY);
    localStorage.removeItem(LEGACY_ANALYSIS_STORAGE_KEY);
    localStorage.removeItem(ANALYSIS_SCHEMA_VERSION_KEY);
  }
  const localAnalysis = raw ? JSON.parse(raw) : null;
  const shareId = parseShareIdFromLocation();
  const pendingMessagesRaw = localStorage.getItem(PENDING_ANALYSIS_MESSAGES_KEY);
  const shouldShowPendingOverlay = localStorage.getItem(PENDING_ANALYSIS_OVERLAY_KEY) === "1";
  let pendingMessages = null;
  try {
    pendingMessages = pendingMessagesRaw ? JSON.parse(pendingMessagesRaw) : null;
  } catch (_) {
    pendingMessages = null;
  }
  let activeAnalysis = localAnalysis;
  const gate = reportRoot.querySelector("[data-report-login-gate]");
  const content = reportRoot.querySelector("[data-report-content]");
  if (gate) gate.hidden = true;
  if (content) content.hidden = false;
  reportRoot.classList.remove("report--locked");
  console.log("[Blen][report] loading analysis", {
    hasLocalAnalysis: Boolean(localAnalysis),
    hasShareId: Boolean(shareId),
  });

  const renderMissingAnalysisFallback = () => {
    if (!content) return;
    content.innerHTML = `
      <section class="report__story">
        <h2 class="report__story-title">${
          getCurrentLang() === "ko" ? "아직 분석 결과가 없어요" : "Your analysis is not ready yet"
        }</h2>
        <p>${
          getCurrentLang() === "ko"
            ? "채팅을 완료하면 맞춤 연애 리포트를 바로 보여줄게."
            : "Finish the chat and we will show your personalized relationship report."
        }</p>
        <p>${
          getCurrentLang() === "ko"
            ? "서버가 잠시 바쁠 수 있으니 잠깐 뒤에 다시 시도해줘."
            : "The server may be temporarily busy, so please try again shortly."
        }</p>
        <button type="button" class="report__share-btn report__share-btn--secondary" data-report-retry-analysis>${
          getCurrentLang() === "ko" ? "다시 분석 시도" : "Retry Analysis"
        }</button>
        <button type="button" class="report__matching-btn" data-report-back-chat>${
          getCurrentLang() === "ko" ? "채팅으로 돌아가기" : "Back to Chat"
        }</button>
      </section>
    `;
    const backButton = content.querySelector("[data-report-back-chat]");
    const retryButton = content.querySelector("[data-report-retry-analysis]");
    if (retryButton) {
      retryButton.addEventListener("click", async () => {
        if (!(Array.isArray(pendingMessages) && pendingMessages.length)) {
          location.href = localeUrl(getCurrentLang(), "aiChat");
          return;
        }
        retryButton.disabled = true;
        const originalLabel = retryButton.textContent;
        retryButton.textContent = getCurrentLang() === "ko" ? "다시 분석 중..." : "Retrying...";
        try {
          const analysis = await requestAnalysisForReport(pendingMessages);
          localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(analysis));
          localStorage.setItem(ANALYSIS_SCHEMA_VERSION_KEY, ANALYSIS_SCHEMA_VERSION);
          location.reload();
        } catch (error) {
          console.log("[Blen][analysis] retry failed", error);
          retryButton.disabled = false;
          retryButton.textContent = originalLabel;
        }
      });
    }
    if (backButton) {
      backButton.addEventListener("click", () => {
        location.href = localeUrl(getCurrentLang(), "aiChat");
      });
    }
  };

  if (activeAnalysis) {
    setFromAnalysis(activeAnalysis);
    console.log("[Blen][report] analysis loaded", activeAnalysis);
  }

  if (!shareId && (shouldShowPendingOverlay || (Array.isArray(pendingMessages) && pendingMessages.length))) {
    const overlay = ensureAnalyzingOverlay();
    const stopMessageRotation = startAnalyzingOverlayMessages();
    setAnalyzingState(true);
    overlay.hidden = false;
    const minDelay = 2200;
    const startedAt = Date.now();
    (async () => {
      try {
        if (Array.isArray(pendingMessages) && pendingMessages.length) {
          const analysis = await requestAnalysisForReport(pendingMessages);
          activeAnalysis = analysis;
          localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(analysis));
          localStorage.setItem(ANALYSIS_SCHEMA_VERSION_KEY, ANALYSIS_SCHEMA_VERSION);
        }
      } catch (error) {
        console.log("[Blen][analysis] report analysis failed", error);
        activeAnalysis = null;
        localStorage.removeItem(ANALYSIS_STORAGE_KEY);
        localStorage.removeItem(ANALYSIS_SCHEMA_VERSION_KEY);
      } finally {
        localStorage.removeItem(PENDING_ANALYSIS_MESSAGES_KEY);
        localStorage.removeItem(PENDING_ANALYSIS_OVERLAY_KEY);
        const elapsed = Date.now() - startedAt;
        const remain = Math.max(0, minDelay - elapsed);
        window.setTimeout(() => {
          if (activeAnalysis) {
            setFromAnalysis(activeAnalysis);
          }
          setAnalyzingState(false);
          playReportEntrance(overlay, stopMessageRotation);
          if (!activeAnalysis) {
            renderMissingAnalysisFallback();
          }
        }, remain);
      }
    })();
  }

  if (!shareId && !activeAnalysis && !(Array.isArray(pendingMessages) && pendingMessages.length)) {
    renderMissingAnalysisFallback();
    return;
  }

  const copyButton = reportRoot.querySelector("[data-share-copy]");
  const nativeButton = reportRoot.querySelector("[data-share-native]");
  const kakaoButton = reportRoot.querySelector("[data-share-kakao]");
  const instagramButton = reportRoot.querySelector("[data-share-instagram]");
  const toast = reportRoot.querySelector("[data-share-toast]");
  let generatedShareId = shareId || null;
  let toastTimer = null;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 1800);
  }

  async function ensureShareUrl() {
    if (!generatedShareId) generatedShareId = createLocalReportShareId();
    const supabase = await getSupabaseClient();
    if (!supabase) throw new Error("Supabase client unavailable");
    const payload = buildSharePayload(activeAnalysis, generatedShareId);
    const { error } = await supabase.from("shared_reports").insert(payload);
    if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
      throw error;
    }
    const lang = getCurrentLang();
    return `${window.location.origin}/${lang}/report/share/${encodeURIComponent(generatedShareId)}`;
  }

  async function copyShareUrl() {
    if (copyButton) copyButton.disabled = true;
    try {
      const url = await ensureShareUrl();
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const tempInput = document.createElement("input");
        tempInput.value = url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand("copy");
        document.body.removeChild(tempInput);
      }
      showToast(deepGet(window.__BLEN_LOCALE__, "report.shareCopied") || "Link copied!");
    } catch (_) {
      showToast(
        deepGet(window.__BLEN_LOCALE__, "report.shareFailed") ||
          "공유 링크를 만드는 중 문제가 생겼어요. 다시 시도해 주세요."
      );
    } finally {
      if (copyButton) copyButton.disabled = false;
    }
  }

  async function nativeShare() {
    if (nativeButton) nativeButton.disabled = true;
    try {
      if (navigator.share) {
        const url = await ensureShareUrl();
        await navigator.share({
          title: "My Blen AI Relationship Report",
          text: "I just discovered my relationship style with Blen AI.",
          url,
        });
      } else {
        await copyShareUrl();
      }
    } catch (_) {
      showToast(
        deepGet(window.__BLEN_LOCALE__, "report.shareFailed") ||
          "공유 링크를 만드는 중 문제가 생겼어요. 다시 시도해 주세요."
      );
    } finally {
      if (nativeButton) nativeButton.disabled = false;
    }
  }

  function showComingSoon() {
    showToast(
      deepGet(window.__BLEN_LOCALE__, "report.shareComingSoon") ||
        "This share option is coming soon."
    );
  }

  if (copyButton) copyButton.addEventListener("click", copyShareUrl);
  if (nativeButton) nativeButton.addEventListener("click", nativeShare);
  if (kakaoButton) kakaoButton.addEventListener("click", showComingSoon);
  if (instagramButton) instagramButton.addEventListener("click", showComingSoon);

  const startAnalysisButton = reportRoot.querySelector("[data-start-analysis]");
  if (startAnalysisButton) {
    startAnalysisButton.addEventListener("click", () => {
      localStorage.removeItem(ANALYSIS_STORAGE_KEY);
      localStorage.removeItem(LEGACY_ANALYSIS_STORAGE_KEY);
      localStorage.removeItem(ANALYSIS_SCHEMA_VERSION_KEY);
      localStorage.removeItem(PENDING_REPORT_SAVE_KEY);
      localStorage.removeItem(PENDING_ANALYSIS_MESSAGES_KEY);
      localStorage.removeItem(PENDING_ANALYSIS_OVERLAY_KEY);
      const aiChatPath = localeUrl(getCurrentLang(), "aiChat");
      location.href = aiChatPath;
    });
  }

  const restartButton = reportRoot.querySelector("[data-report-restart]");
  if (restartButton) {
    restartButton.addEventListener("click", () => {
      localStorage.removeItem(ANALYSIS_STORAGE_KEY);
      localStorage.removeItem(LEGACY_ANALYSIS_STORAGE_KEY);
      localStorage.removeItem(ANALYSIS_SCHEMA_VERSION_KEY);
      localStorage.removeItem(PENDING_REPORT_SAVE_KEY);
      localStorage.removeItem(PENDING_ANALYSIS_MESSAGES_KEY);
      localStorage.removeItem(PENDING_ANALYSIS_OVERLAY_KEY);
      const aiChatPath = localeUrl(getCurrentLang(), "aiChat");
      location.href = aiChatPath;
    });
  }

  const matchingButton = reportRoot.querySelector("[data-report-matching]");
  const heroCtaButton = reportRoot.querySelector("[data-report-hero-cta]");
  const quickShareButton = reportRoot.querySelector("[data-report-share-quick]");
  const shareSection = reportRoot.querySelector("[data-report-share]");
  const revealTargets = reportRoot.querySelectorAll(
    ".report__hero, .report__insights, .report__article, .report__matching, .report__share"
  );

  revealTargets.forEach((el) => el.classList.add("report__reveal"));
  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("is-visible"));
  }

  if (matchingButton) {
    matchingButton.addEventListener("click", () => {
      const relationshipTestPath = localeUrl(getCurrentLang(), "relationshipTest");
      location.href = relationshipTestPath;
    });
  }
  if (heroCtaButton) {
    heroCtaButton.addEventListener("click", () => {
      const relationshipTestPath = localeUrl(getCurrentLang(), "relationshipTest");
      location.href = relationshipTestPath;
    });
  }
  if (quickShareButton && shareSection) {
    quickShareButton.addEventListener("click", () => {
      shareSection.scrollIntoView({ behavior: "smooth", block: "start" });
      if (nativeButton && typeof navigator.share === "function") {
        nativeShare();
      }
    });
  }

  if (shareId) {
    (async () => {
      const sharedAnalysis = await fetchSharedReportById(shareId);
      if (sharedAnalysis) {
        activeAnalysis = sharedAnalysis;
        setFromAnalysis(activeAnalysis);
        console.log("[Blen][report] shared analysis loaded", activeAnalysis);
      }
    })();
  }
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
  bindLangDropdown();
  bindHeaderNav();
  bindLangToggle();
  bindStoreLinks();
  bindSupportForm();
  bindPreviewCarousel();
  bindPreviewCTA();
  bindRelationshipTestCTA();
  bindAiChatFlow();
  bindLoginPage();
  bindReportPage();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
