// Preloader and sparkles
const prefersReducedMotion =
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Footer year + reveal effect
function setCopyrightYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function revealContent() {
  const elements = document.querySelectorAll(".js-reveal.is-hidden");
  elements.forEach((el) => {
    const delay = parseFloat(el.getAttribute("data-delay")) || 0;
    if (prefersReducedMotion) {
      el.classList.remove("is-hidden");
      return;
    }
    setTimeout(() => el.classList.remove("is-hidden"), delay * 1000);
  });
}

// Copy email on contact page
function setupCopyEmail() {
  const copyBtn = document.getElementById("copyEmailBtn");
  const messageEl = document.getElementById("copy-message");
  if (!copyBtn || !messageEl) return;

  copyBtn.addEventListener("click", async () => {
    const email = copyBtn.getAttribute("data-email");
    if (!email) return;

    try {
      await navigator.clipboard.writeText(email);
      messageEl.textContent = "Email copied to clipboard!";
      messageEl.classList.add("show");
      setTimeout(() => messageEl.classList.remove("show"), 2500);
    } catch (err) {
      messageEl.textContent = "Failed to copy email.";
      messageEl.classList.add("show");
      setTimeout(() => messageEl.classList.remove("show"), 3000);
      console.error("Could not copy text:", err);
    }
  });
}

// Loading bar
function startLoadingBar() {
  const preloader = document.getElementById("preloader");
  const bar = document.getElementById("progressBar");
  if (!preloader || !bar) return;

  let progress = 0;
  let rafId;
  let loaded = false;
  const MIN_SHOW_MS = 1200;
  const FINAL_SWEEP_MS = 600;
  const startedAt = performance.now();

  function tick(now) {
    if (!loaded) {
      const elapsed = now - startedAt;
      const fastCurve = 1 - Math.exp(-elapsed / 800);
      const target = 85 * fastCurve;
      progress = Math.min(progress + 0.4, target);
      bar.style.width = progress.toFixed(2) + "%";
      bar.parentElement.setAttribute("aria-valuenow", Math.round(progress));
      rafId = requestAnimationFrame(tick);
    }
  }

  if (!prefersReducedMotion) {
    rafId = requestAnimationFrame(tick);
  } else {
    progress = 85;
    bar.style.width = "85%";
  }

  function finalize() {
    const timeSoFar = performance.now() - startedAt;
    const wait = Math.max(0, MIN_SHOW_MS - timeSoFar);

    const runFinal = () => {
      cancelAnimationFrame(rafId);
      loaded = true;

      bar.style.transition = `width ${FINAL_SWEEP_MS}ms ease`;
      bar.style.width = "100%";
      bar.parentElement.setAttribute("aria-valuenow", "100");

      setTimeout(() => {
        preloader.classList.add("hidden");
        preloader.addEventListener(
          "transitionend",
          () => {
            preloader.remove();
            initSparkles();
            revealContent();
          },
          { once: true }
        );
      }, 300);
    };

    wait > 0 ? setTimeout(runFinal, wait) : runFinal();
  }

  if (document.readyState === "complete") {
    finalize();
  } else {
    window.addEventListener("load", finalize, { once: true });
  }
}

// Sparkles background
const PARTICLES_CDN =
  "https://cdn.jsdelivr.net/npm/tsparticles@2/tsparticles.bundle.min.js";

function loadTsParticles() {
  return new Promise((res, rej) => {
    if (window.tsParticles) return res();
    const s = document.createElement("script");
    s.src = PARTICLES_CDN;
    s.onload = res;
    s.onerror = () => rej(new Error("Failed to load tsParticles"));
    document.head.appendChild(s);
  });
}

async function initSparkles() {
  if (prefersReducedMotion) return;
  await loadTsParticles();

  tsParticles.load({
    id: "sparkles",
    options: {
      background: { color: "transparent" },
      fullScreen: { enable: false },
      detectRetina: true,
      fpsLimit: 60,
      particles: {
        number: { value: 70, density: { enable: true, area: 900 } },
        color: { value: ["#5aa7ff", "#ffffff"] },
        shape: { type: "circle" },
        opacity: { value: 0.8 },
        size: { value: { min: 0.6, max: 1.3 } },
        move: { enable: true, speed: 0.6, random: true, outModes: { default: "bounce" } },
      },
      interactivity: {
        detectsOn: "window",
        events: { onHover: { enable: true, mode: "repulse" }, resize: true },
        modes: { repulse: { distance: 80, duration: 0.25 } },
      },
    },
  });

  document.addEventListener("visibilitychange", () => {
    const c = tsParticles.domItem(0);
    if (!c) return;
    document.hidden ? c.pause() : c.play();
  });
}

// Tech stack filter (about page)
function setupTechStackFilter() {
  const container = document.querySelector(".stack-card");
  if (!container) return;

  const buttons = container.querySelectorAll(".stack-filter");
  const theTags = container.querySelectorAll(".tag");

  function applyFilter(type) {
    theTags.forEach((tag) => {
      const group = tag.getAttribute("data-group");
      const show = type === "all" || group === type;
      tag.classList.toggle("is-hidden", !show);
    });
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      applyFilter(btn.getAttribute("data-filter"));
    });
  });

  applyFilter("all");
}

// Tabs on project pages
function setupProjectDetailTabs() {
  const container = document.querySelector(".pd-tabs");
  if (!container) return;

  const buttons = container.querySelectorAll(".tab-btn");
  const panels = container.querySelectorAll(".tab-panel");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");

      const targetId = btn.getAttribute("aria-controls");
      panels.forEach((p) => p.classList.toggle("is-hidden", p.id !== targetId));
    });
  });
}

// Run everything
document.addEventListener("DOMContentLoaded", () => {
  startLoadingBar();
  setCopyrightYear();
  setupCopyEmail();
  setupTechStackFilter();
  setupProjectDetailTabs();
});
