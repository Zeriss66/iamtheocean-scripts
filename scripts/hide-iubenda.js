const hideIubenda = () => {
  document
    .querySelectorAll("button.iubenda-tp-btn.iubenda-cs-preferences-link")
    .forEach((btn) => btn.style.setProperty("display", "none", "important"));
};

hideIubenda();

const observer = new MutationObserver(hideIubenda);
observer.observe(document.body, { childList: true, subtree: true });
