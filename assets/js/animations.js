/**
 * Enhanced Animations Module
 * Additional scroll-triggered and interactive animations
 */

(function () {
  "use strict";

  if (typeof window === "undefined") return;

  // Parallax effect for hero sections
  function initParallax() {
    const parallaxElements = document.querySelectorAll("[data-parallax]");
    if (!parallaxElements.length) return;

    let ticking = false;
    function updateParallax() {
      parallaxElements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const scrolled = window.scrollY;
        const elementTop = el.offsetTop;
        const speed = el.dataset.parallax || 0.5;
        const yPos = (scrolled - elementTop) * speed;
        el.style.transform = `translateY(${yPos}px)`;
      });
      ticking = false;
    }

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateParallax);
        }
      },
      { passive: true }
    );
  }

  // Float animation for elements
  function initFloatingElements() {
    const floatElements = document.querySelectorAll("[data-float]");
    if (!floatElements.length) return;

    floatElements.forEach((el) => {
      const duration = el.dataset.float || 3;
      const amount = el.dataset.floatAmount || 8;
      el.style.animation = `float ${duration}s ease-in-out infinite`;
      el.style.setProperty("--float-amount", `${amount}px`);
    });

    // Inject keyframes if not already present
    if (!document.getElementById("float-keyframes")) {
      const style = document.createElement("style");
      style.id = "float-keyframes";
      style.textContent = `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(var(--float-amount, 8px)); }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Pulse animation for elements
  function initPulseElements() {
    const pulseElements = document.querySelectorAll("[data-pulse]");
    if (!pulseElements.length) return;

    pulseElements.forEach((el) => {
      const duration = el.dataset.pulse || 2;
      el.style.animation = `pulse ${duration}s cubic-bezier(0.4, 0, 0.6, 1) infinite`;
    });

    if (!document.getElementById("pulse-keyframes")) {
      const style = document.createElement("style");
      style.id = "pulse-keyframes";
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Gradient shift animation
  function initGradientShift() {
    const gradElements = document.querySelectorAll("[data-gradient-shift]");
    if (!gradElements.length) return;

    gradElements.forEach((el) => {
      const duration = el.dataset.gradientShift || 8;
      el.style.animation = `gradient-shift ${duration}s ease infinite`;
      el.style.backgroundSize = "200% 200%";
    });

    if (!document.getElementById("gradient-keyframes")) {
      const style = document.createElement("style");
      style.id = "gradient-keyframes";
      style.textContent = `
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Slide in on scroll
  function initSlideInElements() {
    const slideElements = document.querySelectorAll("[data-slide-in]");
    if (!slideElements.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const direction = entry.target.dataset.slideIn || "up";
            entry.target.classList.add("is-sliding-in");
            entry.target.style.setProperty("--slide-direction", direction);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    slideElements.forEach((el) => observer.observe(el));

    if (!document.getElementById("slide-in-keyframes")) {
      const style = document.createElement("style");
      style.id = "slide-in-keyframes";
      style.textContent = `
        [data-slide-in] {
          opacity: 0;
          transform: translateY(30px);
        }
        [data-slide-in].is-sliding-in {
          animation: slide-in-up 0.6s ease-out forwards;
        }
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Stagger animation for lists
  function initStaggerElements() {
    const staggerGroups = document.querySelectorAll("[data-stagger]");
    if (!staggerGroups.length) return;

    staggerGroups.forEach((group) => {
      const children = group.querySelectorAll("[data-stagger-child]");
      const delay = parseFloat(group.dataset.stagger) || 0.1;

      children.forEach((child, index) => {
        child.style.setProperty("--stagger-delay", `${index * delay}s`);
        child.classList.add("is-stagger-child");
      });
    });

    if (!document.getElementById("stagger-keyframes")) {
      const style = document.createElement("style");
      style.id = "stagger-keyframes";
      style.textContent = `
        [data-stagger-child] {
          opacity: 0;
          animation: fade-in 0.5s ease-out forwards;
          animation-delay: var(--stagger-delay, 0s);
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Glow effect on hover
  function initGlowElements() {
    const glowElements = document.querySelectorAll("[data-glow]");
    if (!glowElements.length) return;

    glowElements.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        el.style.setProperty("--glow-x", `${x}px`);
        el.style.setProperty("--glow-y", `${y}px`);
      });
    });

    if (!document.getElementById("glow-keyframes")) {
      const style = document.createElement("style");
      style.id = "glow-keyframes";
      style.textContent = `
        [data-glow] {
          position: relative;
          overflow: hidden;
        }
        [data-glow]::before {
          content: '';
          position: absolute;
          width: 100px;
          height: 100px;
          background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
          pointer-events: none;
          top: calc(var(--glow-y, 0) - 50px);
          left: calc(var(--glow-x, 0) - 50px);
          opacity: 0;
          transition: opacity 0.2s ease;
        }
        [data-glow]:hover::before {
          opacity: 1;
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Initialize all animations
  function init() {
    initParallax();
    initFloatingElements();
    initPulseElements();
    initGradientShift();
    initSlideInElements();
    initStaggerElements();
    initGlowElements();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
