document.addEventListener("DOMContentLoaded", () => {
  const textContainer = document.getElementById("textContainer");
  if (!textContainer) return;

  const TEXT = textContainer.innerText.trim(); // Prende il testo direttamente da Webflow
  const OPACITY_INITIAL = 0.25; // Opacità iniziale delle lettere/parole
  const OPACITY_FINAL = 1; // Opacità finale quando rivelate
  const REVEAL_BY_WORD = false; // true = parola per parola, false = lettera per lettera
  const ANIMATION_SPEED = 0.3; // Velocità di animazione (in secondi)
  const REVERSE_ON_SCROLL_UP = true; // true = le lettere tornano trasparenti se si scrolla all'insù

  let SCROLL_SENSITIVITY;
  let VIEWPORT_TRIGGER;

  function updateSettings() {
    const width = window.innerWidth;
    if (width > 990) {
      SCROLL_SENSITIVITY = 4;
      VIEWPORT_TRIGGER = 0.7;
    } else if (width > 767) {
      SCROLL_SENSITIVITY = 6;
      VIEWPORT_TRIGGER = 0.6;
    } else if (width > 480) {
      SCROLL_SENSITIVITY = 7;
      VIEWPORT_TRIGGER = 0.5;
    } else {
      SCROLL_SENSITIVITY = 2;
      VIEWPORT_TRIGGER = 0.4;
    }
  }

  updateSettings();
  window.addEventListener("resize", updateSettings);

  textContainer.innerHTML = "";
  const units = REVEAL_BY_WORD ? TEXT.split(" ") : TEXT.split("");

  units.forEach((unit) => {
    const span = document.createElement("span");
    span.textContent = unit + (REVEAL_BY_WORD ? " " : "");
    span.classList.add("unit");
    span.style.opacity = OPACITY_INITIAL;
    span.style.transition = `opacity ${ANIMATION_SPEED}s ease-out`;
    span.style.willChange = "opacity";
    span.style.transform = "translateZ(0)";
    textContainer.appendChild(span);
  });

  const elements = document.querySelectorAll(".unit");
  let lastScrollTop = window.scrollY;
  let ticking = false;

  function handleScroll() {
    const rect = textContainer.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const startReveal = viewportHeight * VIEWPORT_TRIGGER;
    let scrollTop = window.scrollY;
    let scrollingDown = scrollTop > lastScrollTop;
    lastScrollTop = scrollTop;

    if (rect.top < startReveal) {
      const visiblePart = startReveal - rect.top;

      elements.forEach((element, index) => {
        if (index < visiblePart / SCROLL_SENSITIVITY) {
          element.style.opacity = OPACITY_FINAL;
        } else if (REVERSE_ON_SCROLL_UP && !scrollingDown) {
          element.style.opacity = OPACITY_INITIAL;
        }
      });
    } else if (REVERSE_ON_SCROLL_UP) {
      elements.forEach((element) => {
        element.style.opacity = OPACITY_INITIAL;
      });
    }
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(handleScroll);
    }
  });
});
