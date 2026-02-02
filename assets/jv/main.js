"use strict";

(() => {
  const qs = (selector, scope = document) => scope.querySelector(selector);
  const qsa = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const addClass = (el, name) => el && el.classList.add(name);
  const removeClass = (el, name) => el && el.classList.remove(name);

  const initMobileMenu = () => {
    const toggle = qs(".menu-toggle");
    const menu = qs("#mobile-menu");
    if (!toggle || !menu) return;

    const setOpen = (open) => {
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
      document.body.classList.toggle("menu-open", open);
    };

    toggle.addEventListener("click", () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setOpen(false);
    });

    qsa("a", menu).forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });
  };

  const splitText = (element) => {
    if (!element || element.dataset.splitReady === "true") return;
    const text = element.textContent.trim();
    if (!text) return;

    element.dataset.splitReady = "true";
    element.setAttribute("aria-label", text);
    element.setAttribute("role", "text");
    element.textContent = "";

    const fragment = document.createDocumentFragment();
    [...text].forEach((char, index) => {
      const span = document.createElement("span");
      span.className = "char";
      span.setAttribute("aria-hidden", "true");
      span.dataset.index = String(index);
      span.textContent = char === " " ? "\u00A0" : char;
      fragment.appendChild(span);
    });
    element.appendChild(fragment);
  };

  const animateSplit = (element) => {
    if (prefersReducedMotion || !element) return;
    const chars = qsa(".char", element);
    if (!chars.length) return;

    chars.forEach((char, index) => {
      char.animate(
        [
          { opacity: 0, transform: "translateY(12px)" },
          { opacity: 1, transform: "translateY(0px)" },
        ],
        {
          duration: 500,
          delay: index * 18,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        }
      );
    });
  };

  const initReveal = () => {
    const revealTargets = qsa("[data-reveal]");
    revealTargets.forEach((el) => addClass(el, "reveal"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = Number(el.dataset.revealDelay || 0);
          setTimeout(() => {
            addClass(el, "is-visible");
            if (el.dataset.split === "chars") animateSplit(el);
          }, delay);
          observer.unobserve(el);
        });
      },
      {
        threshold: 0.2,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    revealTargets.forEach((el) => {
      if (el.closest(".hero__slide")) return;
      observer.observe(el);
    });
  };

  const initParallax = () => {
    if (prefersReducedMotion) return;
    const parallaxEls = qsa("[data-parallax]");
    if (!parallaxEls.length) return;

    let ticking = false;

    const update = () => {
      const viewport = window.innerHeight;
      parallaxEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const mid = rect.top + rect.height / 2;
        const progress = (mid - viewport / 2) / viewport;
        const strength = Number(el.dataset.parallaxStrength || 14);
        const offset = Math.max(-40, Math.min(40, -progress * strength));
        el.style.transform = `translateY(${offset}px)`;
      });
      ticking = false;
    };

    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener("scroll", requestTick, { passive: true });
    window.addEventListener("resize", requestTick);
    requestTick();
  };

  const initMarquee = () => {
    if (prefersReducedMotion) return;
    const marquee = qs("[data-marquee]");
    if (!marquee) return;

    let rafId = null;
    let speed = 0.25;
    let isPaused = false;

    const step = () => {
      if (!isPaused) {
        marquee.scrollLeft += speed;
        if (marquee.scrollLeft >= marquee.scrollWidth - marquee.clientWidth) {
          marquee.scrollLeft = 0;
        }
      }
      rafId = requestAnimationFrame(step);
    };

    marquee.addEventListener("mouseenter", () => (isPaused = true));
    marquee.addEventListener("mouseleave", () => (isPaused = false));
    marquee.addEventListener("touchstart", () => (isPaused = true), { passive: true });
    marquee.addEventListener("touchend", () => (isPaused = false));

    rafId = requestAnimationFrame(step);
    window.addEventListener("beforeunload", () => cancelAnimationFrame(rafId));
  };

  const initCarousel = () => {
    const carousel = qs("[data-carousel]");
    if (!carousel) return;

    const track = qs("[data-carousel-track]", carousel);
    const slides = qsa("[data-slide]", carousel);
    const prevBtn = qs("[data-carousel-prev]", carousel);
    const nextBtn = qs("[data-carousel-next]", carousel);
    const dots = qsa("[data-carousel-dot]", carousel);

    if (!track || slides.length === 0) return;

    let currentIndex = slides.findIndex((slide) => slide.getAttribute("aria-hidden") === "false");
    if (currentIndex < 0) currentIndex = 0;

    const autoplayEnabled = carousel.dataset.autoplay === "true" && !prefersReducedMotion;
    const interval = Number(carousel.dataset.interval || 6500);
    let timer = null;
    let isPaused = false;

    const setActiveSlide = (index, { instant = false } = {}) => {
      currentIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, i) => {
        const isActive = i === currentIndex;
        slide.setAttribute("aria-hidden", String(!isActive));
        slide.classList.toggle("is-active", isActive);

        const revealEls = qsa("[data-reveal]", slide);
        revealEls.forEach((el) => {
          addClass(el, "reveal");
          removeClass(el, "is-visible");
        });

        if (isActive) {
          const banner = qs(".hero__banner", slide);
          if (banner && !prefersReducedMotion) {
            banner.animate(
              [
                { opacity: 0.6, transform: "scale(1.06)" },
                { opacity: 0.85, transform: "scale(1.02)" },
              ],
              { duration: instant ? 1 : 800, easing: "ease-out", fill: "forwards" }
            );
          }

          revealEls.forEach((el) => {
            const delay = Number(el.dataset.revealDelay || 0);
            setTimeout(() => {
              addClass(el, "is-visible");
              if (el.dataset.split === "chars") animateSplit(el);
            }, instant ? 0 : delay);
          });
        }
      });

      dots.forEach((dot, i) => {
        const active = i === currentIndex;
        dot.setAttribute("aria-selected", String(active));
        dot.tabIndex = active ? 0 : -1;
      });
    };

    const next = () => setActiveSlide(currentIndex + 1);
    const prev = () => setActiveSlide(currentIndex - 1);

    const startAutoplay = () => {
      if (!autoplayEnabled) return;
      if (timer) clearInterval(timer);
      timer = setInterval(() => {
        if (!isPaused) next();
      }, interval);
    };

    const pauseAutoplay = () => {
      isPaused = true;
    };

    const resumeAutoplay = () => {
      isPaused = false;
    };

    prevBtn && prevBtn.addEventListener("click", prev);
    nextBtn && nextBtn.addEventListener("click", next);

    dots.forEach((dot) => {
      dot.addEventListener("click", () => {
        const index = Number(dot.dataset.carouselDot || 0);
        setActiveSlide(index);
      });
    });

    let touchStartX = 0;
    carousel.addEventListener("touchstart", (event) => {
      touchStartX = event.touches[0].clientX;
      pauseAutoplay();
    });

    carousel.addEventListener("touchend", (event) => {
      const diff = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(diff) > 40) {
        diff < 0 ? next() : prev();
      }
      resumeAutoplay();
    });

    carousel.addEventListener("mouseenter", pauseAutoplay);
    carousel.addEventListener("mouseleave", resumeAutoplay);
    carousel.addEventListener("focusin", pauseAutoplay);
    carousel.addEventListener("focusout", resumeAutoplay);

    carousel.setAttribute("tabindex", "0");
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") next();
      if (event.key === "ArrowLeft") prev();
    });

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pauseAutoplay();
      else resumeAutoplay();
    });

    setActiveSlide(currentIndex, { instant: true });
    startAutoplay();
  };

  const initCtaCarousels = () => {
    const carousels = qsa("[data-cta-carousel]");
    if (!carousels.length) return;

    carousels.forEach((carousel) => {
      const slides = qsa("[data-cta-slide]", carousel);
      if (!slides.length) return;

      const prevBtn = qs("[data-cta-prev]", carousel);
      const nextBtn = qs("[data-cta-next]", carousel);
      const dots = qsa("[data-cta-dot]", carousel);

      let index = slides.findIndex((slide) => slide.getAttribute("aria-hidden") === "false");
      if (index < 0) index = 0;

      const autoplayEnabled = carousel.dataset.autoplay === "true" && !prefersReducedMotion;
      const interval = Number(carousel.dataset.interval || 5200);
      let timer = null;
      let isPaused = false;

      const setActive = (nextIndex, { instant = false } = {}) => {
        index = (nextIndex + slides.length) % slides.length;

        slides.forEach((slide, i) => {
          const isActive = i === index;
          slide.setAttribute("aria-hidden", String(!isActive));
          slide.classList.toggle("is-active", isActive);

          if (isActive && !prefersReducedMotion && !instant) {
            slide.animate(
              [
                { opacity: 0, transform: "translateY(10px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              { duration: 500, easing: "ease-out", fill: "forwards" }
            );
          }
        });

        dots.forEach((dot, i) => {
          const active = i === index;
          dot.setAttribute("aria-selected", String(active));
          dot.tabIndex = active ? 0 : -1;
        });
      };

      const next = () => setActive(index + 1);
      const prev = () => setActive(index - 1);

      const startAutoplay = () => {
        if (!autoplayEnabled) return;
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
          if (!isPaused) next();
        }, interval);
      };

      const pause = () => {
        isPaused = true;
      };

      const resume = () => {
        isPaused = false;
      };

      prevBtn && prevBtn.addEventListener("click", prev);
      nextBtn && nextBtn.addEventListener("click", next);

      dots.forEach((dot) => {
        dot.addEventListener("click", () => {
          const idx = Number(dot.dataset.ctaDot || 0);
          setActive(idx);
        });
      });

      carousel.addEventListener("mouseenter", pause);
      carousel.addEventListener("mouseleave", resume);
      carousel.addEventListener("focusin", pause);
      carousel.addEventListener("focusout", resume);

      setActive(index, { instant: true });
      startAutoplay();
    });
  };

  const initGallery3D = () => {
    const gallery = qs("[data-gallery-3d]");
    if (!gallery) return;

    const stack = qs(".gallery-stack", gallery);
    const cards = qsa(".gallery-card", gallery);
    if (!stack || !cards.length) return;

    let currentIndex = 0;
    let autoTimer = null;
    let rafId = null;
    let isPaused = false;
    let isDragging = false;
    let startX = 0;
    let floatPhase = 0;
    let isVisible = true;

    const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

    // Calculate signed offset relative to the active card.
    const getRelativeIndex = (index) => {
      let rel = index - currentIndex;
      if (rel > cards.length / 2) rel -= cards.length;
      if (rel < -cards.length / 2) rel += cards.length;
      return rel;
    };

    // Apply 3D transforms for every card.
    const updatePositions = (instant = false) => {
      cards.forEach((card, index) => {
        const rel = getRelativeIndex(index);
        const abs = Math.abs(rel);

        const depth = 50;
        const spread = 56;
        const lift = abs === 0 ? "var(--lift, 0px)" : "0px";
        const z = -abs * depth;
        const x = rel * spread;
        const y = abs * 10;
        const rotateY = rel * -8;
        const rotateX = -3;
        const scale = 1 - abs * 0.025;

        card.style.opacity = String(clamp(1 - abs * 0.08, 0.35, 1));
        card.style.transform = `translate3d(${x}px, ${y}px, ${z}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(${scale}) translateY(${lift})`;
        card.style.zIndex = String(cards.length - abs);

        card.classList.toggle("is-front", abs === 0);
        card.setAttribute("aria-selected", abs === 0 ? "true" : "false");
        card.tabIndex = abs === 0 ? 0 : -1;

        if (instant) {
          card.style.transitionDuration = "0ms";
          requestAnimationFrame(() => {
            card.style.transitionDuration = "";
          });
        }
      });
    };

    const setActive = (nextIndex, options = {}) => {
      currentIndex = (nextIndex + cards.length) % cards.length;
      updatePositions(options.instant);
    };

    const next = () => setActive(currentIndex + 1);
    const prev = () => setActive(currentIndex - 1);

    const startAutoplay = () => {
      if (prefersReducedMotion) return;
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = setInterval(() => {
        if (!isPaused) next();
      }, 5200);
    };

    const stopAutoplay = () => {
      if (autoTimer) clearInterval(autoTimer);
      autoTimer = null;
    };

    // Idle floating animation for cinematic feel.
    const floatLoop = () => {
      if (prefersReducedMotion || !isVisible) return;
      floatPhase += 0.02;
      const floatY = Math.sin(floatPhase) * 6;
      const floatR = Math.cos(floatPhase) * 0.6;
      stack.style.setProperty("--float-y", `${floatY}px`);
      stack.style.setProperty("--float-r", `${floatR}deg`);
      rafId = requestAnimationFrame(floatLoop);
    };

    const setTilt = (x, y) => {
      stack.style.setProperty("--tilt-x", `${x}deg`);
      stack.style.setProperty("--tilt-y", `${y}deg`);
    };

    const resetTilt = () => setTilt(0, 0);

    const handlePointerDown = (event) => {
      isDragging = true;
      startX = event.clientX;
      stack.classList.add("is-dragging");
      isPaused = true;
      stopAutoplay();
    };

    const handlePointerMove = (event) => {
      if (!isDragging) return;
      const delta = event.clientX - startX;
      if (Math.abs(delta) > 60) {
        startX = event.clientX;
        delta > 0 ? prev() : next();
      }
    };

    const handlePointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      stack.classList.remove("is-dragging");
      isPaused = false;
      startAutoplay();
    };

    cards.forEach((card, index) => {
      card.dataset.index = String(index);
      card.addEventListener("click", () => setActive(index));
      card.addEventListener("focus", () => setActive(index));
    });

    gallery.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        prev();
      }
    });

    const prevBtn = qs("[data-gallery-prev]", gallery);
    const nextBtn = qs("[data-gallery-next]", gallery);
    prevBtn && prevBtn.addEventListener("click", prev);
    nextBtn && nextBtn.addEventListener("click", next);

    gallery.addEventListener("pointerdown", handlePointerDown);
    gallery.addEventListener("pointermove", handlePointerMove);
    gallery.addEventListener("pointerup", handlePointerUp);
    gallery.addEventListener("pointerleave", handlePointerUp);

    gallery.addEventListener("mousemove", (event) => {
      if (prefersReducedMotion) return;
      const rect = gallery.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      setTilt(py * -6, px * 10);
    });
    gallery.addEventListener("mouseleave", resetTilt);

    gallery.addEventListener("mouseenter", () => {
      isPaused = true;
    });
    gallery.addEventListener("mouseleave", () => {
      isPaused = false;
    });
    gallery.addEventListener("focusin", () => {
      isPaused = true;
    });
    gallery.addEventListener("focusout", () => {
      isPaused = false;
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            updatePositions(true);
            startAutoplay();
            if (!rafId) rafId = requestAnimationFrame(floatLoop);
          } else {
            stopAutoplay();
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(gallery);
    updatePositions(true);
    if (!prefersReducedMotion) rafId = requestAnimationFrame(floatLoop);
    startAutoplay();
  };

  const init = () => {
    document.documentElement.classList.add("js");
    qsa('[data-split="chars"]').forEach(splitText);
    initReveal();
    initCarousel();
    initCtaCarousels();
    initGallery3D();
    initParallax();
    initMarquee();
    initMobileMenu();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
