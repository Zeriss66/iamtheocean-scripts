// Lenis
const lenis = new Lenis({
  lerp: 0.1,
  wheelMultiplier: 0.7,
  gestureOrientation: "vertical",
  smoothTouch: false,
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}

requestAnimationFrame(raf);

document.querySelectorAll("[data-lenis-start]").forEach((element) => {
  element.addEventListener("click", () => lenis.start());
});

document.querySelectorAll("[data-lenis-stop]").forEach((element) => {
  element.addEventListener("click", () => lenis.stop());
});

document.querySelectorAll("[data-lenis-toggle]").forEach((element) => {
  element.addEventListener("click", function () {
    this.classList.toggle("stop-scroll");
    if (this.classList.contains("stop-scroll")) {
      lenis.stop();
    } else {
      lenis.start();
    }
  });
});
