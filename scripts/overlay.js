document.addEventListener("DOMContentLoaded", function () {
  const menuOverlay = document.querySelector(".menu-overlay");
  const categoryListContainer = document.querySelector(".navbar_category-list");
  const cmsWrapper = document.querySelector(".navbar_cms-wrapper");
  const subcategoryList = document.querySelector(".navbar_subcategory-list");

  if (
    !menuOverlay ||
    !categoryListContainer ||
    !cmsWrapper ||
    !subcategoryList
  ) {
    console.error("Uno o più elementi non esistono nel DOM!");
    return;
  }

  function checkOverlay() {
    const categoryDisplay = getComputedStyle(categoryListContainer).display;
    const categoryVisibility = getComputedStyle(
      categoryListContainer
    ).visibility;

    const cmsDisplay = getComputedStyle(cmsWrapper).display;
    const cmsVisibility = getComputedStyle(cmsWrapper).visibility;

    const subcategoryDisplay = getComputedStyle(subcategoryList).display;
    const subcategoryVisibility = getComputedStyle(subcategoryList).visibility;

    console.log(
      `categoryListContainer: ${categoryDisplay}, visibility: ${categoryVisibility}`
    );
    console.log(`cmsWrapper: ${cmsDisplay}, visibility: ${cmsVisibility}`);
    console.log(
      `subcategoryList: ${subcategoryDisplay}, visibility: ${subcategoryVisibility}`
    );

    if (
      (categoryDisplay === "flex" && categoryVisibility !== "hidden") ||
      (cmsDisplay === "flex" && cmsVisibility !== "hidden") ||
      (subcategoryDisplay === "flex" && subcategoryVisibility !== "hidden")
    ) {
      console.log("Mostro il menu-overlay!");
      menuOverlay.style.display = "flex";
      menuOverlay.style.pointerEvents = "auto";

      setTimeout(() => {
        menuOverlay.style.opacity = "1";
      }, 10);
    } else {
      console.log("Nascondo il menu-overlay!");
      menuOverlay.style.opacity = "0";
      menuOverlay.style.pointerEvents = "none";

      setTimeout(() => {
        if (menuOverlay.style.opacity === "0") {
          menuOverlay.style.display = "none";
        }
      }, 300);
    }
  }

  // Osserviamo cambiamenti nello stile e nelle classi degli elementi
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      console.log(`Mutation detected on: ${mutation.target.className}`);
    });
    checkOverlay();
  });

  observer.observe(categoryListContainer, {
    attributes: true,
    attributeFilter: ["style", "class"],
  });
  observer.observe(cmsWrapper, {
    attributes: true,
    attributeFilter: ["style", "class"],
  });
  observer.observe(subcategoryList, {
    attributes: true,
    attributeFilter: ["style", "class"],
  });

  console.log("MutationObserver avviato!");
  checkOverlay();
});
