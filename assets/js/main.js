/* =============================================================================
 * Kilstar ICT and Business Consultants — shared behaviour
 * -----------------------------------------------------------------------------
 * Vanilla JS, no dependencies. Every module is opt-in via data attributes and
 * guards itself, so each page only wires up what it actually contains.
 *
 *   [data-nav-toggle] [data-nav-menu]   mobile navigation drawer
 *   [data-dropdown]                      desktop mega-menu
 *   [data-tabs]                          tabbed panels (roving tabindex)
 *   [data-accordion]                     FAQ disclosure list
 *   [data-modal-open="id"] [data-modal]  accessible dialog
 *   form[data-validate]                   lead-gen form + validation
 *   [data-reveal] [data-counter]         scroll animation
 *   [data-filter] [data-filter-search]   resource library filtering
 *   [data-year]                          current year
 * ========================================================================== */
(function () {
  "use strict";

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };
  // Tells the inline <head> guard that this file loaded, so it can leave the
  // scroll-reveal content visible (see the timeout in each page's <head>).
  document.documentElement.setAttribute("data-js-ready", "true");
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FOCUSABLE =
    'a[href],area[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),' +
    "select:not([disabled]),textarea:not([disabled]),iframe,[tabindex]:not([tabindex=\"-1\"]),[contenteditable]";

  function onReady(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn);
  }

  /* --- Tiny helpers ------------------------------------------------------- */

  function lockScroll(locked) {
    document.body.style.overflow = locked ? "hidden" : "";
    document.body.style.paddingRight = locked
      ? window.innerWidth - document.documentElement.clientWidth + "px"
      : "";
  }

  /* Trap Tab focus inside a container, and restore focus on close. */
  function createFocusTrap(container) {
    var previouslyFocused = document.activeElement;
    function focusables() {
      return $$(FOCUSABLE, container).filter(function (el) {
        return el.offsetWidth || el.offsetHeight || el.getClientRects().length;
      });
    }
    function onKeydown(e) {
      if (e.key !== "Tab") return;
      var items = focusables();
      if (!items.length) return e.preventDefault();
      var first = items[0];
      var last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    container.addEventListener("keydown", onKeydown);
    return function release() {
      container.removeEventListener("keydown", onKeydown);
      if (previouslyFocused && previouslyFocused.focus) previouslyFocused.focus();
    };
  }

  /* =========================================================================
   * 1. Sticky header — elevation on scroll
   * ====================================================================== */
  function initHeader() {
    var header = $("[data-header]");
    if (!header) return;
    var ticking = false;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
      ticking = false;
    }
    window.addEventListener(
      "scroll",
      function () {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(update);
        }
      },
      { passive: true }
    );
    update();
  }

  /* =========================================================================
   * 2. Mobile navigation drawer
   * ====================================================================== */
  function initMobileNav() {
    var toggle = $("[data-nav-toggle]");
    var menu = $("[data-nav-menu]");
    if (!toggle || !menu) return;

    var panel = menu.querySelector("[data-nav-panel]") || menu;
    var open = false;

    function setOpen(next) {
      open = next;
      toggle.setAttribute("aria-expanded", String(next));
      menu.hidden = !next;
      menu.classList.toggle("is-open", next);
      lockScroll(next);
      // Swap the hamburger / close glyph.
      var openIcon = $("[data-icon-open]", toggle);
      var closeIcon = $("[data-icon-close]", toggle);
      if (openIcon) openIcon.classList.toggle("hidden", next);
      if (closeIcon) closeIcon.classList.toggle("hidden", !next);
      var srText = $(".sr-only", toggle);
      if (srText) srText.textContent = next ? "Close main menu" : "Open main menu";
      if (next) {
        var first = $(FOCUSABLE, panel);
        if (first) first.focus();
      }
    }

    setOpen(false);

    toggle.addEventListener("click", function () {
      setOpen(!open);
    });

    // Close when a link inside the drawer is chosen.
    $$("a", menu).forEach(function (link) {
      link.addEventListener("click", function () {
        setOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && open) {
        setOpen(false);
        toggle.focus();
      }
    });

    // Reset the drawer if the viewport grows to the desktop breakpoint.
    var desktop = window.matchMedia("(min-width: 1024px)");
    function onChange(e) {
      if (e.matches && open) setOpen(false);
    }
    if (desktop.addEventListener) desktop.addEventListener("change", onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* =========================================================================
   * 2b. Mobile drawer sub-menus (Services ▸)
   * ====================================================================== */
  function initSubmenus() {
    $$("[data-submenu]").forEach(function (wrap) {
      var trigger = $("[data-submenu-trigger]", wrap);
      if (!trigger) return;
      var open = false;
      function setOpen(next) {
        open = next;
        wrap.classList.toggle("is-open", next);
        trigger.setAttribute("aria-expanded", String(next));
      }
      trigger.addEventListener("click", function () {
        setOpen(!open);
      });
    });
  }

  /* =========================================================================
   * 3. Desktop dropdown (Services mega-menu)
   * ====================================================================== */
  function initDropdowns() {
    $$("[data-dropdown]").forEach(function (wrap) {
      var trigger = $("[data-dropdown-trigger]", wrap);
      var panel = $("[data-dropdown-panel]", wrap);
      if (!trigger || !panel) return;
      var open = false;
      var hoverCapable = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

      function setOpen(next) {
        open = next;
        trigger.setAttribute("aria-expanded", String(next));
        wrap.classList.toggle("is-open", next);
      }

      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        setOpen(!open);
      });
      trigger.addEventListener("keydown", function (e) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setOpen(true);
          var first = $(FOCUSABLE, panel);
          if (first) first.focus();
        }
      });
      if (hoverCapable) {
        wrap.addEventListener("mouseenter", function () {
          setOpen(true);
        });
        wrap.addEventListener("mouseleave", function () {
          setOpen(false);
        });
      }
      // Close when focus leaves the component entirely.
      wrap.addEventListener("focusout", function (e) {
        if (!wrap.contains(e.relatedTarget)) setOpen(false);
      });
    });

    document.addEventListener("click", function (e) {
      $$("[data-dropdown].is-open").forEach(function (wrap) {
        if (!wrap.contains(e.target)) {
          var trigger = $("[data-dropdown-trigger]", wrap);
          if (trigger) trigger.setAttribute("aria-expanded", "false");
          wrap.classList.remove("is-open");
        }
      });
    });
  }

  /* =========================================================================
   * 4. Tabs — click, arrow keys, Home/End, roving tabindex
   * ====================================================================== */
  function initTabs() {
    $$("[data-tabs]").forEach(function (group) {
      var tabs = $$('[role="tab"]', group);
      if (!tabs.length) return;
      var vertical = group.getAttribute("data-tabs") === "vertical";

      function select(tab, focus) {
        tabs.forEach(function (t) {
          var selected = t === tab;
          t.setAttribute("aria-selected", String(selected));
          t.tabIndex = selected ? 0 : -1;
          var panel = document.getElementById(t.getAttribute("aria-controls"));
          if (panel) panel.hidden = !selected;
        });
        if (focus) tab.focus();
        group.dispatchEvent(
          new CustomEvent("tabchange", { detail: { id: tab.id, value: tab.dataset.value } })
        );
      }

      tabs.forEach(function (tab, i) {
        tab.addEventListener("click", function () {
          select(tab, false);
        });
        tab.addEventListener("keydown", function (e) {
          var next = null;
          var prevKey = vertical ? "ArrowUp" : "ArrowLeft";
          var nextKey = vertical ? "ArrowDown" : "ArrowRight";
          if (e.key === nextKey) next = tabs[(i + 1) % tabs.length];
          else if (e.key === prevKey) next = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (e.key === "Home") next = tabs[0];
          else if (e.key === "End") next = tabs[tabs.length - 1];
          if (next) {
            e.preventDefault();
            select(next, true);
          }
        });
      });
    });
  }

  /* =========================================================================
   * 5. Accordion (FAQ) — single or multi open
   * ====================================================================== */
  function initAccordion() {
    $$("[data-accordion]").forEach(function (root) {
      var single = root.dataset.accordion === "single";
      var triggers = $$("[data-acc-trigger]", root);

      function setState(trigger, next) {
        var panel = document.getElementById(trigger.getAttribute("aria-controls"));
        trigger.setAttribute("aria-expanded", String(next));
        if (panel) panel.dataset.open = String(next);
      }

      triggers.forEach(function (trigger) {
        // Establish the initial state from markup so it works without JS too.
        setState(trigger, trigger.getAttribute("aria-expanded") === "true");
        trigger.addEventListener("click", function () {
          var next = trigger.getAttribute("aria-expanded") !== "true";
          if (single && next) {
            triggers.forEach(function (t) {
              if (t !== trigger) setState(t, false);
            });
          }
          setState(trigger, next);
        });
      });
    });
  }

  /* =========================================================================
   * 6. Modal dialog
   * ====================================================================== */
  var openModals = [];

  function initModals() {
    $$("[data-modal]").forEach(function (modal) {
      var panel = $("[data-modal-panel]", modal) || modal.firstElementChild;
      var releaseTrap = null;

      function open(trigger) {
        if (!modal.hidden) return;
        modal.hidden = false;
        openModals.push(modal);
        modal.__kilstarTrigger = trigger || document.activeElement;
        lockScroll(true);
        releaseTrap = createFocusTrap(panel || modal);
        // Focus the first real control, skipping the dismiss button.
        window.requestAnimationFrame(function () {
          var targets = $$(FOCUSABLE, panel || modal).filter(function (el) {
            return !el.hasAttribute("data-modal-close");
          });
          (targets[0] || $("[data-modal-close]", modal) || panel).focus();
        });
      }

      function close() {
        if (modal.hidden) return;
        modal.hidden = true;
        openModals = openModals.filter(function (m) {
          return m !== modal;
        });
        if (!openModals.length) lockScroll(false);
        if (releaseTrap) releaseTrap();
        releaseTrap = null;
        var t = modal.__kilstarTrigger;
        if (t && t.focus) t.focus();
      }

      modal.__kilstar = { open: open, close: close };

      // Backdrop click — only when the press started on the overlay itself.
      modal.addEventListener("mousedown", function (e) {
        if (e.target === modal) close();
      });
      $$("[data-modal-close]", modal).forEach(function (el) {
        el.addEventListener("click", close);
      });
    });

    // Delegated triggers: <button data-modal-open="audit-modal"> anywhere.
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-modal-open]");
      if (!trigger) return;
      var modal = document.getElementById(trigger.dataset.modalOpen);
      if (!modal || !modal.__kilstar) return;
      e.preventDefault();
      modal.__kilstar.open(trigger);
    });

    // Escape closes the topmost dialog.
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && openModals.length) {
        openModals[openModals.length - 1].__kilstar.close();
      }
    });

    // Deep link: /contact.html#audit-modal opens the dialog on load.
    if (window.location.hash.length > 1) {
      var deep = document.getElementById(window.location.hash.slice(1));
      if (deep && deep.__kilstar) deep.__kilstar.open(null);
    }
  }

  /* =========================================================================
   * 7. Lead form validation + async submit
   * ====================================================================== */
  function initForms() {
    $$("form[data-validate]").forEach(function (form) {
      var fields = $$("[name]", form).filter(function (el) {
        return el.type !== "hidden" && el.type !== "submit";
      });
      var status = $("[data-form-status]", form);
      var summary = $("[data-form-summary]", form);
      var submitBtn = $("[type=submit]", form);
      var submitLabel = submitBtn ? submitBtn.innerHTML : "";

      function ruleFor(field) {
        var rules = [];
        var type = (field.type || "").toLowerCase();
        var required = field.hasAttribute("required");
        // Note: a checkbox has no value, so "required" must test .checked — not length.
        if (required) {
          rules.push(function (v, f) {
            if (f.type === "checkbox") return f.checked || "Please confirm to continue.";
            return v.length > 0 || "This field is required.";
          });
        }
        if (type === "email") {
          rules.push(function (v) {
            if (!v) return required ? "Email is required." : true;
            return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v) || "Enter a valid email address, e.g. you@company.com";
          });
        }
        if (type === "tel") {
          rules.push(function (v) {
            if (!v) return true;
            return /^[+()\d\s.-]{7,20}$/.test(v) || "Enter a valid phone number.";
          });
        }
        if (field.minLength > 0) {
          rules.push(function (v) {
            return v.length >= field.minLength ||
              "Must be at least " + field.minLength + " characters (currently " + v.length + ").";
          });
        }
        if (field.tagName === "SELECT" && required) {
          rules.push(function (v) { return v !== "" || "Please choose an option."; });
        }
        return rules;
      }

      function errorElFor(field) {
        // Guarantee every field has a unique id before deriving the error id.
        if (!field.id) {
          Array.prototype.forEach.call(form.querySelectorAll("[name]"), function (el, i) {
            if (!el.id) el.id = "f-" + (el.getAttribute("name") || i);
          });
        }
        var id = (field.id || field.name) + "-error";
        var el = document.getElementById(id);
        if (!el) {
          el = document.createElement("p");
          el.className = "error-msg";
          el.id = id;
          el.setAttribute("role", "alert");
          el.hidden = true;
          var describedBy = (field.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
          if (describedBy.indexOf(id) === -1) {
            describedBy.push(id);
            field.setAttribute("aria-describedby", describedBy.join(" "));
          }
          // A checkbox sits inside its own <label> alongside the help text, so
          // the message has to go after the label, not after the input.
          if (field.type === "checkbox" && field.closest("label")) {
            field.closest("label").insertAdjacentElement("afterend", el);
          } else {
            field.insertAdjacentElement("afterend", el);
          }
        }
        return el;
      }

      function validateField(field, silent) {
        var value = (field.type === "checkbox" ? "" : field.value || "").trim();
        var message = null;
        ruleFor(field).some(function (rule) {
          var res = rule(value, field);
          if (res !== true) {
            message = res;
            return true;
          }
          return false;
        });
        var errEl = errorElFor(field);
        var invalid = !!message;
        field.setAttribute("aria-invalid", String(invalid));
        if (!silent) {
          errEl.textContent = invalid ? message : "";
          errEl.hidden = !invalid;
        }
        return !invalid;
      }

      fields.forEach(function (field) {
        field.addEventListener("blur", function () {
          if (field.value.trim() || field.hasAttribute("required")) validateField(field);
        });
        field.addEventListener("input", function () {
          // Only clear an existing error as the user corrects it.
          if (field.getAttribute("aria-invalid") === "true") validateField(field);
        });
      });

      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var firstInvalid = null;
        fields.forEach(function (field) {
          if (!validateField(field) && !firstInvalid) firstInvalid = field;
        });

        if (firstInvalid) {
          if (summary) {
            summary.hidden = false;
            summary.textContent =
              "Please correct the " +
              (fields.filter(function (f) { return f.getAttribute("aria-invalid") === "true"; }).length) +
              " highlighted field(s) below and try again.";
          }
          firstInvalid.focus();
          return;
        }

        if (summary) summary.hidden = true;

        // Demo submission — swap for your CRM / form endpoint (see README).
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML =
            '<span class="inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" aria-hidden="true"></span>Sending…';
          if (status) status.textContent = "Sending your request…";
        }

        window.setTimeout(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = submitLabel;
          }
          form.reset();
          fields.forEach(function (field) {
            field.removeAttribute("aria-invalid");
            var e2 = document.getElementById((field.id || field.name) + "-error");
            if (e2) {
              e2.textContent = "";
              e2.hidden = true;
            }
          });
          if (status) {
            status.textContent =
              "Thank you — your request is in. A solutions engineer will reply within one business day.";
            status.dataset.state = "success";
          }
        }, 900);
      });
    });
  }

  /* =========================================================================
   * 8. Scroll reveal + animated counters
   * ====================================================================== */
  function initReveal() {
    var items = $$("[data-reveal]");
    if (!items.length) return;
    if (reducedMotion || !("IntersectionObserver" in window)) {
      items.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          if (el.dataset.revealDelay) {
            el.style.setProperty("--reveal-delay", el.dataset.revealDelay + "ms");
          }
          el.classList.add("is-visible");
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );
    items.forEach(function (el) {
      io.observe(el);
    });
  }

  function initCounters() {
    var counters = $$("[data-counter]");
    if (!counters.length) return;

    function run(el) {
      var target = parseFloat(el.dataset.counter);
      var decimals = parseInt(el.dataset.decimals || "0", 10);
      var prefix = el.dataset.prefix || "";
      var suffix = el.dataset.suffix || "";
      function render(v) {
        el.textContent = prefix + v.toFixed(decimals) + suffix;
      }
      if (reducedMotion) return render(target);
      var duration = 1400;
      var start = null;
      function step(ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - p, 4); // easeOutQuart
        render(target * eased);
        if (p < 1) window.requestAnimationFrame(step);
        else render(target);
      }
      window.requestAnimationFrame(step);
    }

    if (!("IntersectionObserver" in window)) {
      counters.forEach(run);
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          run(entry.target);
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach(function (el) {
      io.observe(el);
    });
  }

  /* =========================================================================
   * 9. Resource library filtering
   * ====================================================================== */
  function initFilters() {
    $$("[data-filter-group]").forEach(function (group) {
      var buttons = $$("[data-filter]", group);
      var targetId = group.dataset.filterGroup;
      var items = $$('[data-filter-item="' + targetId + '"]');
      var search = $('[data-filter-search="' + targetId + '"]');
      var countEl = $('[data-filter-count="' + targetId + '"]');
      var emptyEl = $('[data-filter-empty="' + targetId + '"]');
      var active = "all";

      function apply() {
        var q = (search && search.value ? search.value : "").trim().toLowerCase();
        var shown = 0;
        items.forEach(function (item) {
          var cats = (item.dataset.category || "").toLowerCase();
          var text = (item.textContent || "").toLowerCase();
          var matchCat = active === "all" || cats.indexOf(active) !== -1;
          var matchText = !q || text.indexOf(q) !== -1;
          var show = matchCat && matchText;
          item.hidden = !show;
          if (show) shown++;
        });
        buttons.forEach(function (b) {
          b.setAttribute("aria-pressed", String(b.dataset.filter === active));
        });
        if (countEl) countEl.textContent = String(shown);
        if (emptyEl) emptyEl.hidden = shown !== 0;
      }

      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          active = btn.dataset.filter;
          apply();
        });
      });
      if (search) search.addEventListener("input", apply);
      apply();
    });
  }

  /* =========================================================================
   * 10. Prefill the quote form from ?service=
   * ====================================================================== */
  function initPrefill() {
    var params = new URLSearchParams(window.location.search);
    var service = params.get("service");
    var topic = params.get("topic");
    $$("form[data-validate]").forEach(function (form) {
      if (service) {
        var select = form.querySelector('select[name="service"]');
        if (select) {
          var match = $$("option", select).find(function (o) {
            return o.value.toLowerCase() === service.toLowerCase();
          });
          if (match) select.value = match.value;
        }
      }
      if (topic) {
        var message = form.querySelector('textarea[name="message"]');
        if (message && !message.value) message.value = topic;
      }
    });
  }

  /* =========================================================================
   * 11. Footer year
   * ====================================================================== */
  function initYear() {
    $$("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  }

  /* =========================================================================
   * Boot
   * ====================================================================== */
  onReady(function () {
    initHeader();
    initMobileNav();
    initSubmenus();
    initDropdowns();
    initTabs();
    initAccordion();
    initModals();
    initForms();
    initReveal();
    initCounters();
    initFilters();
    initPrefill();
    initYear();
  });
})();
