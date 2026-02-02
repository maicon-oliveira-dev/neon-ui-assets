"use strict";

(() => {
  const inputs = Array.from(document.querySelectorAll(".field input, .field textarea, .field select"));
  inputs.forEach((input) => {
    const field = input.closest(".field");
    const toggleFilled = () => {
      if (!field) return;
      field.classList.toggle("is-filled", Boolean(input.value));
    };
    input.addEventListener("input", toggleFilled);
    input.addEventListener("blur", toggleFilled);
    toggleFilled();
  });

  const copyButtons = Array.from(document.querySelectorAll("[data-copy-text]"));
  copyButtons.forEach((button) => {
    const original = button.textContent;
    button.addEventListener("click", async () => {
      const text = button.dataset.copyText || "";
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Copiado";
        button.classList.add("is-copied");
        setTimeout(() => {
          button.textContent = original;
          button.classList.remove("is-copied");
        }, 1500);
      } catch (error) {
        button.textContent = "Copie manual";
        setTimeout(() => {
          button.textContent = original;
        }, 1500);
      }
    });
  });
})();
