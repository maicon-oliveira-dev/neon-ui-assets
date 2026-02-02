"use strict";

(() => {
  const items = Array.from(document.querySelectorAll(".accordion__item"));
  if (!items.length) return;

  const closeItem = (item) => {
    const button = item.querySelector(".accordion__button");
    const content = item.querySelector(".accordion__content");
    if (!button || !content) return;
    item.classList.remove("is-open");
    button.setAttribute("aria-expanded", "false");
    content.style.maxHeight = "0px";
  };

  const openItem = (item) => {
    const button = item.querySelector(".accordion__button");
    const content = item.querySelector(".accordion__content");
    if (!button || !content) return;
    item.classList.add("is-open");
    button.setAttribute("aria-expanded", "true");
    content.style.maxHeight = `${content.scrollHeight}px`;
  };

  items.forEach((item, index) => {
    const button = item.querySelector(".accordion__button");
    const content = item.querySelector(".accordion__content");
    if (!button || !content) return;

    button.addEventListener("click", () => {
      const isOpen = item.classList.contains("is-open");
      items.forEach(closeItem);
      if (!isOpen) openItem(item);
    });

    if (index === 0) openItem(item);
  });
})();
