"use strict";

(() => {
  const buttons = Array.from(document.querySelectorAll("[data-filter]"));
  const posts = Array.from(document.querySelectorAll("[data-post]"));
  if (!buttons.length || !posts.length) return;

  const setActive = (filter) => {
    buttons.forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.filter === filter);
    });

    posts.forEach((post) => {
      const category = post.dataset.category || "";
      const match = filter === "all" || category.includes(filter);
      post.classList.toggle("is-hidden", !match);
    });
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setActive(btn.dataset.filter || "all");
    });
  });
})();
