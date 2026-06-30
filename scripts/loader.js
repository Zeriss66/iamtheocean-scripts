// Page Loader Navigation + Asset Decode & Paint-aware + bfcache Safety

const PAGE_SWITCH_DELAY = 500; // ms
let navigating = false;

function isSameOrigin(link) {
  try {
    return new URL(link.href, location.href).origin === location.origin;
  } catch {
    return false;
  }
}

/* -------------------------
   Helpers for readiness
-------------------------- */

// Wait for next animation frame (n times)
function nextFrame(times = 1) {
  return new Promise((resolve) => {
    const step = () => (times-- > 0 ? requestAnimationFrame(step) : resolve());
    requestAnimationFrame(step);
  });
}

// Decode a single image with timeout + fallback
function decodeImage(img, timeoutMs = 1500) {
  // If not complete or has zero size, still try to decode
  if (typeof img.decode !== "function") {
    // Safari < 16 fallback or unsupported: resolve immediately
    return Promise.resolve();
  }
  const p = img.decode().catch(() => {}); // ignore decode errors, e.g., CORS
  const t = new Promise((resolve) => setTimeout(resolve, timeoutMs));
  // Race decode vs timeout so we don't block forever
  return Promise.race([p, t]);
}

// Decode all in-document <img> elements
async function decodeAllImages() {
  const imgs = Array.from(document.images || []);
  if (imgs.length === 0) return;
  const jobs = imgs.map((img) => decodeImage(img));
  await Promise.allSettled(jobs);
}

// Wait for fonts (if supported)
async function waitForFonts() {
  try {
    if (document.fonts && typeof document.fonts.ready?.then === "function") {
      await document.fonts.ready;
    }
  } catch {
    /* ignore */
  }
}

// Instantly hide any loaders (used for back/forward restores)
function hideLoadersImmediately() {
  document.querySelectorAll(".page-loader").forEach((el) => {
    el.style.transition = "none";
    el.style.willChange = "auto";
    el.style.transform = "translateY(-100vh)"; // hidden state (off top)
    el.style.display = "none";
  });
}

// Detect back/forward restores (bfcache) robustly
function cameFromBackForward() {
  const nav = performance.getEntriesByType?.("navigation")?.[0];
  if (nav && nav.type === "back_forward") return true;
  if (performance.navigation && performance.navigation.type === 2) return true; // legacy
  return false;
}

/* -------------------------
   Animations
-------------------------- */

function triggerInAnimation() {
  const loader = document.querySelector(".page-loader.is_in");
  if (!loader) return;

  loader.style.display = ""; // ensure visible
  loader.style.willChange = "transform";
  loader.style.transition = "none";
  loader.style.transform = "translateY(100vh)"; // start off-screen bottom

  // Force reflow, then animate into place
  loader.getBoundingClientRect();
  requestAnimationFrame(() => {
    loader.style.transition = `transform ${PAGE_SWITCH_DELAY}ms ease-in-out`;
    loader.style.transform = "translateY(0vh)";
  });
}

function triggerOutAnimation() {
  const loaderOut = document.querySelector(".page-loader.is_out");
  if (!loaderOut) return;

  loaderOut.style.display = ""; // show for the animation
  loaderOut.style.willChange = "transform";
  loaderOut.style.transition = "none";
  loaderOut.style.transform = "translateY(0vh)"; // on-screen
  loaderOut.getBoundingClientRect();

  requestAnimationFrame(() => {
    loaderOut.style.transition = `transform ${PAGE_SWITCH_DELAY}ms ease-in-out`;
    loaderOut.style.transform = "translateY(-100vh)"; // slide out top
  });

  const onEnd = (e) => {
    if (e.propertyName !== "transform") return;
    loaderOut.style.display = "none";
    loaderOut.removeEventListener("transitionend", onEnd);
  };
  loaderOut.addEventListener("transitionend", onEnd, { once: true });
}

/* -------------------------
   Navigation intercept
-------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  document.body.addEventListener("click", (event) => {
    if (navigating) return;

    const link = event.target.closest("a[href]");
    if (!link) return;

    const url = link.getAttribute("href");

    // Ignore conditions
    if (
      !url ||
      url.startsWith("#") ||
      link.target === "_blank" ||
      link.classList.contains("untrigger-loader") ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey || // modifiers = new tab/window
      !isSameOrigin(link) // only intercept same-origin navigations
    ) {
      return;
    }

    event.preventDefault();
    navigating = true;

    triggerInAnimation();

    // Navigate after the IN animation completes (fallback to delay)
    setTimeout(() => {
      window.location.href = link.href;
    }, PAGE_SWITCH_DELAY);
  });
});

/* -------------------------
   Page show / load handling
-------------------------- */

// pageshow fires on initial load AND on bfcache restores
window.addEventListener("pageshow", async (evt) => {
  navigating = false;

  // If restored from bfcache, the page is already painted: hide immediately
  if (evt.persisted || cameFromBackForward()) {
    hideLoadersImmediately();
    return;
  }

  // Keep the loader until ALL assets are loaded
  const runOut = async () => {
    // 1) wait fonts (if any)
    await waitForFonts();

    // 2) ensure all <img> are decoded (prevents blank boxes)
    await decodeAllImages();

    // 3) give the browser time to layout & paint (two rAF ticks)
    await nextFrame(2);

    // 4) play out animation
    triggerOutAnimation();
  };

  if (document.readyState === "complete") {
    // Assets already loaded -> proceed with decode/paint settling
    runOut();
  } else {
    // Wait for window.load (all assets), then settle & animate out
    window.addEventListener("load", runOut, { once: true });
  }
});

// Extra safety: when user navigates via Back/Forward (history pop)
window.addEventListener("popstate", hideLoadersImmediately);
