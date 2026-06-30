window.addEventListener("DOMContentLoaded", function () {
  const listContainer = document.querySelector(".navbar_products-wrapper");
  const items = Array.from(listContainer.children);

  items.sort((a, b) => {
    const textA = a.textContent.trim().toUpperCase();
    const textB = b.textContent.trim().toUpperCase();
    return textA.localeCompare(textB);
  });

  // Rimuove tutti gli elementi e li reinserisce ordinati
  items.forEach((item) => listContainer.appendChild(item));
});
