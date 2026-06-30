const productSlider = new Swiper(".product-card_carousel-cms", {
  // Optional parameters
  loop: true,

  // Navigation arrows
  navigation: {
    nextEl: ".product-slider_arrow.is-carousel.is-next",
    prevEl: ".product-slider_arrow.is-carousel.is-prev",
  },

  // Responsive breakpoints
  breakpoints: {
    // when window width is >= 320px
    320: {
      slidesPerView: 2,
      spaceBetween: 12,
    },
    // when window width is >= 480px
    480: {
      slidesPerView: 2,
      spaceBetween: 14,
    },
    // when window width is   >= 480px
    760: {
      slidesPerView: 2,
      spaceBetween: 16,
    },
    // when window width is >= 640px
    1200: {
      slidesPerView: 3,
      // slidesPerGroup: 3,
      spaceBetween: 20,
    },
  },
});
