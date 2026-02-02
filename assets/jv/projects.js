"use strict";

(() => {
  const buttons = Array.from(document.querySelectorAll("[data-filter]"));
  const cards = Array.from(document.querySelectorAll("[data-project]"));
  if (!buttons.length || !cards.length) return;

  const setActive = (filter) => {
    buttons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === filter);
    });

    cards.forEach((card) => {
      const category = card.dataset.category || "";
      const match = filter === "all" || category.includes(filter);
      card.classList.toggle("is-hidden", !match);
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActive(btn.dataset.filter || "all");
    });
  });
})();
