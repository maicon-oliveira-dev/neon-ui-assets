"use strict";

(() => {
  const gallery = document.querySelector(".project-gallery");
  if (!gallery) return;

  const mainImage = gallery.querySelector("[data-gallery-main]");
  const thumbs = Array.from(gallery.querySelectorAll("[data-gallery-thumb]"));
  if (!mainImage || !thumbs.length) return;

  const setActive = (button) => {
    thumbs.forEach((thumb) => thumb.classList.remove("is-active"));
    button.classList.add("is-active");

    const nextSrc = button.dataset.image;
    const nextAlt = button.dataset.alt || "";
    if (!nextSrc) return;

    mainImage.src = nextSrc;
    mainImage.alt = nextAlt;
    mainImage.animate(
      [
        { opacity: 0.2, transform: "scale(0.98)" },
        { opacity: 1, transform: "scale(1)" },
      ],
      { duration: 420, easing: "ease-out", fill: "forwards" }
    );
  };

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => setActive(thumb));
  });
})();
