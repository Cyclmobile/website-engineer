const body = document.body;
const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navLinks = document.querySelectorAll(".site-nav a");
const sections = [...document.querySelectorAll("main section[id]")];
const revealItems = document.querySelectorAll(".reveal");
const faqItems = document.querySelectorAll(".faq-item");
const year = document.querySelector("[data-year]");
const langButtons = document.querySelectorAll("[data-lang]");
const translations = window.MH_TRANSLATIONS || {};
const LANG_KEY = "mh-lang";

let currentLang = "en";

const t = (key) => translations[currentLang]?.[key] ?? translations.en?.[key];

const applyLanguage = (lang) => {
  currentLang = translations[lang] ? lang : "en";
  document.documentElement.lang = currentLang;

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    el.alt = t(el.dataset.i18nAlt);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });

  document.title = t("meta.title");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));
  navToggle?.setAttribute("aria-label", t(body.classList.contains("nav-open") ? "menu.close" : "menu.open"));

  langButtons.forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.lang === currentLang));
  });

  try {
    localStorage.setItem(LANG_KEY, currentLang);
  } catch {
    // Storage can be unavailable (private mode); the switch still works for this visit.
  }
};

const getInitialLanguage = () => {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved) {
      return saved;
    }
  } catch {
    // Fall through to the browser language.
  }
  return (navigator.language || "").toLowerCase().startsWith("so") ? "so" : "en";
};

langButtons.forEach((button) => {
  button.addEventListener("click", () => applyLanguage(button.dataset.lang));
});

applyLanguage(getInitialLanguage());

if (year) {
  year.textContent = new Date().getFullYear();
}

const closeNav = () => {
  body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", t("menu.open"));
};

navToggle?.addEventListener("click", () => {
  const isOpen = body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", t(isOpen ? "menu.close" : "menu.open"));
});

navLinks.forEach((link) => {
  link.addEventListener("click", closeNav);
});

document.addEventListener("keyup", (event) => {
  if (event.key === "Escape") {
    closeNav();
  }
});

const handleScroll = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 10);

  let current = null;
  for (let index = sections.length - 1; index >= 0; index -= 1) {
    const section = sections[index];
    if (section.getBoundingClientRect().top <= 120) {
      current = section;
      break;
    }
  }

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", current ? link.getAttribute("href") === `#${current.id}` : false);
  });
};

window.addEventListener("scroll", handleScroll, { passive: true });
handleScroll();

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

faqItems.forEach((item) => {
  const button = item.querySelector("button");
  const icon = item.querySelector(".faq-icon");

  button?.addEventListener("click", () => {
    const isOpen = item.classList.toggle("is-open");
    button.setAttribute("aria-expanded", String(isOpen));
    if (icon) {
      icon.textContent = isOpen ? "-" : "+";
    }
  });
});
