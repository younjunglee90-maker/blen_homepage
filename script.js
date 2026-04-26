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

function createFallbackAnalysis() {
  return {
    values: {
      relationship_goal: "unclear",
      money_values: "unclear",
      lifestyle: "unclear",
      family_values: "unclear",
      work_life_balance: "unclear",
    },
    attachment: {
      secure: 0.5,
      anxious: 0.5,
      avoidant: 0.5,
      primary_attachment: "unclear",
    },
    conflict_style: {
      avoidant: 0.5,
      aggressive: 0.5,
      defensive: 0.5,
      solution_oriented: 0.5,
      primary_conflict_style: "unclear",
    },
    personality: {
      impulsivity: 0.5,
      anxiety: 0.5,
      empathy: 0.5,
      self_control: 0.5,
    },
    report_inputs: {
      headline_keyword: "천천히 맞춰가는 연결",
      relationship_style: "너는 진심과 안정감을 기반으로 관계를 깊게 쌓아가는 스타일이야.",
      core_values: ["상호 존중", "솔직한 감정 표현", "꾸준한 신뢰"],
      attraction_pattern: "편안함과 다정함이 느껴지는 사람에게 더 깊이 끌리는 편이야.",
      communication_style: "갈등이 생겨도 대화를 통해 균형을 찾으려는 성향이 강해.",
      emotional_pattern: "감정을 쉽게 소비하지 않고, 오래 생각한 뒤 진심을 전하는 패턴이 보여.",
      dealbreakers: ["상호 존중이 없는 관계", "감정 대화를 피하는 패턴"],
      strengths: ["공감 능력", "관계를 지키려는 책임감"],
      risks: ["상대의 반응을 과하게 신경 쓰며 혼자 지칠 수 있어."],
      ideal_partner_traits: ["대화를 존중하는 사람", "감정적으로 안정적인 사람"],
      one_line_summary: "너는 진심을 주고받는 안정적인 관계에서 가장 빛나는 사람이야.",
    },
    confidence: {
      overall: 0.2,
      missing_data: ["conversation_depth"],
    },
  };
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
  const totalQuestions = 13;

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
  const conversationHistory = [];
  const sendButton = form.querySelector(".ai-chat__send");
  const sendLabel = sendButton ? sendButton.textContent : "";

  renderChatBubble(messagesEl, firstMessage, "ai");
  conversationHistory.push({ role: "assistant", content: firstMessage });
  if (guidanceMessage) {
    renderChatBubble(messagesEl, guidanceMessage, "ai");
    conversationHistory.push({ role: "assistant", content: guidanceMessage });
  }

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

  async function requestAnalysis() {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: conversationHistory }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "Failed to analyze conversation");
    }
    return response.json();
  }

  async function completeAfterFinalAnswer() {
    if (analysisRequested) return;
    analysisRequested = true;

    renderChatBubble(
      messagesEl,
      deepGet(window.__BLEN_LOCALE__, "aiChat.finalAckMessage") ||
        "좋아, 충분히 알겠어. 지금 너의 연애 성향을 분석해볼게.",
      "ai"
    );
    renderChatBubble(
      messagesEl,
      deepGet(window.__BLEN_LOCALE__, "aiChat.analyzingMessage") || "분석 중...",
      "ai"
    );

    try {
      const analysis = await requestAnalysis();
      localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(analysis));
      updateProgress(true);
      const reportPath = localeUrl(getCurrentLang(), "report");
      window.setTimeout(() => {
        location.href = reportPath;
      }, 420);
      return;
    } catch (error) {
      const fallbackAnalysis = createFallbackAnalysis();
      localStorage.setItem(ANALYSIS_STORAGE_KEY, JSON.stringify(fallbackAnalysis));
      updateProgress(true);
      const reportPath = localeUrl(getCurrentLang(), "report");
      window.setTimeout(() => {
        location.href = reportPath;
      }, 420);
      return;
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

  const fallback = createFallbackAnalysis();
  const setFromAnalysis = (analysis) => {
    const report = analysis.report_inputs || fallback.report_inputs;
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
    const isKo = getCurrentLang() === "ko";
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
    const setTag = (selector, value) => {
      const el = reportRoot.querySelector(selector);
      if (el) el.textContent = value;
    };
    setTag("[data-report-tag1]", tag1);
    setTag("[data-report-tag2]", attachmentTag);
    setTag("[data-report-tag3]", trustTag);
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
      values: row?.values_json || fallback.values,
      attachment: row?.attachment_json || fallback.attachment,
      conflict_style: row?.conflict_json || fallback.conflict_style,
      personality: row?.personality_json || fallback.personality,
      report_inputs: reportInputsFromIdeal || reportInputsFromText || fallback.report_inputs,
      confidence: fallback.confidence,
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
    const reportInputs = analysis?.report_inputs || fallback.report_inputs;
    return {
      share_id: shareId,
      report_text: JSON.stringify(reportInputs),
      values_json: analysis?.values || fallback.values,
      attachment_json: analysis?.attachment || fallback.attachment,
      conflict_json: analysis?.conflict_style || fallback.conflict_style,
      personality_json: analysis?.personality || fallback.personality,
      ideal_partner_json: {
        ideal_partner_traits: reportInputs.ideal_partner_traits || [],
        one_line_summary: reportInputs.one_line_summary || "",
        report_inputs: reportInputs,
      },
    };
  };

  const raw =
    localStorage.getItem(ANALYSIS_STORAGE_KEY) ||
    localStorage.getItem(LEGACY_ANALYSIS_STORAGE_KEY);
  const localAnalysis = raw ? JSON.parse(raw) : fallback;
  const shareId = parseShareIdFromLocation();
  let activeAnalysis = localAnalysis;
  setFromAnalysis(activeAnalysis);
  const gate = reportRoot.querySelector("[data-report-login-gate]");
  const content = reportRoot.querySelector("[data-report-content]");
  if (gate) gate.hidden = true;
  if (content) content.hidden = false;
  reportRoot.classList.remove("report--locked");

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
    if (copyButton) {
      copyButton.disabled = true;
      copyButton.textContent =
        deepGet(window.__BLEN_LOCALE__, "report.shareLoading") || "Saving link...";
    }
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
      if (copyButton) {
        copyButton.disabled = false;
        copyButton.textContent = deepGet(window.__BLEN_LOCALE__, "report.shareCopy") || "Copy Link";
      }
    }
  }

  async function nativeShare() {
    if (nativeButton) {
      nativeButton.disabled = true;
      nativeButton.textContent =
        deepGet(window.__BLEN_LOCALE__, "report.shareLoading") || "Saving link...";
    }
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
      if (nativeButton) {
        nativeButton.disabled = false;
        nativeButton.textContent =
          deepGet(window.__BLEN_LOCALE__, "report.shareNative") || "Native Share";
      }
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
      localStorage.removeItem(PENDING_REPORT_SAVE_KEY);
      const aiChatPath = localeUrl(getCurrentLang(), "aiChat");
      location.href = aiChatPath;
    });
  }

  const restartButton = reportRoot.querySelector("[data-report-restart]");
  if (restartButton) {
    restartButton.addEventListener("click", () => {
      localStorage.removeItem(ANALYSIS_STORAGE_KEY);
      localStorage.removeItem(LEGACY_ANALYSIS_STORAGE_KEY);
      localStorage.removeItem(PENDING_REPORT_SAVE_KEY);
      const aiChatPath = localeUrl(getCurrentLang(), "aiChat");
      location.href = aiChatPath;
    });
  }

  if (shareId) {
    (async () => {
      const sharedAnalysis = await fetchSharedReportById(shareId);
      if (sharedAnalysis) {
        activeAnalysis = sharedAnalysis;
        setFromAnalysis(activeAnalysis);
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
