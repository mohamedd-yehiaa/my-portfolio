/* ═══════════════════════════════════════════
   Mohamed Yehia — Portfolio Scripts
   ═══════════════════════════════════════════ */

(function () {
  "use strict";

  /* ─── DOM References ─── */
  const html = document.documentElement;
  const header = document.getElementById("header");
  const themeToggle = document.getElementById("themeToggle");
  const hamburger = document.getElementById("hamburger");
  const nav = document.getElementById("nav");
  const navLinks = document.querySelectorAll(".header__nav-link");
  const sections = document.querySelectorAll("section[id]");
  const reveals = document.querySelectorAll(".reveal");
  const statNumbers = document.querySelectorAll(".about__stat-number");

  /* ═════════════════════════════════════════
     1. THEME TOGGLE
     ═════════════════════════════════════════ */
  const THEME_KEY = "portfolio-theme";

  function getStoredTheme() {
    return localStorage.getItem(THEME_KEY);
  }

  function applyTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  // Initialise: respect stored preference, else default to dark
  (function initTheme() {
    const stored = getStoredTheme();
    if (stored) {
      applyTheme(stored);
    }
    // data-theme="dark" is already set in HTML as default
  })();

  themeToggle.addEventListener("click", function () {
    const current = html.getAttribute("data-theme");
    applyTheme(current === "dark" ? "light" : "dark");
  });

  /* ═════════════════════════════════════════
     2. STICKY HEADER ON SCROLL
     ═════════════════════════════════════════ */
  let lastScroll = 0;

  function handleHeaderScroll() {
    const currentScroll = window.scrollY;
    header.classList.toggle("header--scrolled", currentScroll > 0);

    if (currentScroll > lastScroll && currentScroll > 400) {
      header.classList.add("header--hidden");
    } else {
      header.classList.remove("header--hidden");
    }
    lastScroll = currentScroll;
  }

  window.addEventListener("scroll", handleHeaderScroll, { passive: true });

  /* ═════════════════════════════════════════
     3. MOBILE MENU
     ═════════════════════════════════════════ */
  hamburger.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("header__nav--open");
    hamburger.classList.toggle("header__hamburger--active");
    hamburger.setAttribute("aria-expanded", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";
  });

  // Close menu on link click
  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("header__nav--open");
      hamburger.classList.remove("header__hamburger--active");
      hamburger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    });
  });

  /* ═════════════════════════════════════════
     4. ACTIVE NAV HIGHLIGHTING ON SCROLL
     ═════════════════════════════════════════ */
  function highlightNav() {
    const scrollY = window.scrollY + 100;

    sections.forEach(function (section) {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      const sectionId = section.getAttribute("id");

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(function (link) {
          link.classList.remove("header__nav-link--active");
          if (link.getAttribute("href") === "#" + sectionId) {
            link.classList.add("header__nav-link--active");
          }
        });
      }
    });
  }

  window.addEventListener("scroll", highlightNav, { passive: true });

  /* ═════════════════════════════════════════
     5. REVEAL-ON-SCROLL (Intersection Observer)
     ═════════════════════════════════════════ */
  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
  );

  reveals.forEach(function (el) {
    revealObserver.observe(el);
  });

  /* ═════════════════════════════════════════
     6. STAT COUNTER ANIMATION
     ═════════════════════════════════════════ */
  function animateCount(el) {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const duration = 1600; // ms
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  const statObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 },
  );

  statNumbers.forEach(function (num) {
    // Dynamically count matching DOM elements if a selector is provided
    var selector = num.getAttribute("data-target-selector");
    if (selector) {
      var elements = document.querySelectorAll(selector);
      num.setAttribute("data-count", elements.length);
    }
    statObserver.observe(num);
  });

  /* ═════════════════════════════════════════
     7. SMOOTH SCROLL FOR ANCHOR LINKS
     ═════════════════════════════════════════ */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      const targetId = this.getAttribute("href");
      if (targetId === "#") return; // ignore placeholder links
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        const headerOffset = header.offsetHeight + 16;
        const top =
          targetEl.getBoundingClientRect().top + window.scrollY - headerOffset;
        window.scrollTo({ top: top, behavior: "smooth" });
      }
    });
  });

  /* ═════════════════════════════════════════
     8. EXPANDABLE SECTIONS (Projects & Certs)
     ═════════════════════════════════════════ */
  function initExpandableSection(config) {
    var grid = document.getElementById(config.gridId);
    var btn = document.getElementById(config.btnId);
    var wrapper = document.getElementById(config.wrapperId);
    if (!grid || !btn || !wrapper) return;

    var items = grid.querySelectorAll(config.itemSelector);
    var chevron = btn.querySelector("svg");

    // If the total item count doesn't exceed the limit, hide the button
    if (items.length <= config.maxVisible) {
      wrapper.classList.add("section__expand-wrapper--hidden");
      grid.classList.remove(config.collapsedClass);
      return;
    }

    // Helper to update button text + chevron direction
    function updateButtonState(expanded) {
      // Update the text node (first child text before the SVG)
      var textNode = btn.firstChild;
      if (textNode && textNode.nodeType === Node.TEXT_NODE) {
        textNode.textContent = expanded
          ? config.expandedText + " "
          : config.collapsedText + " ";
      }

      // Rotate the entire SVG chevron instead of changing its internal points
      if (chevron) {
        // Adds a smooth turning animation
        chevron.style.transition = "transform 0.3s ease";

        // Rotate 180deg when expanded, back to 0deg when collapsed
        chevron.style.transform = expanded ? "rotate(180deg)" : "rotate(0deg)";
      }
    }

    btn.addEventListener("click", function () {
      var isCollapsed = grid.classList.contains(config.collapsedClass);
      if (isCollapsed) {
        grid.classList.remove(config.collapsedClass);
        btn.setAttribute("aria-expanded", "true");
        updateButtonState(true);
        // Trigger reveal animation on newly visible items
        var hiddenItems = Array.prototype.slice.call(items, config.maxVisible);
        hiddenItems.forEach(function (item, i) {
          if (
            item.classList.contains("reveal") &&
            !item.classList.contains("revealed")
          ) {
            setTimeout(function () {
              item.classList.add("revealed");
            }, i * 80);
          }
        });
      } else {
        grid.classList.add(config.collapsedClass);
        btn.setAttribute("aria-expanded", "false");
        updateButtonState(false);
        // Scroll grid top into view so user isn't left stranded
        grid.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  initExpandableSection({
    gridId: "projectsGrid",
    btnId: "projectsExpandBtn",
    wrapperId: "projectsExpandWrapper",
    itemSelector: ".project-card",
    maxVisible: 3,
    collapsedClass: "projects__grid--collapsed",
    collapsedText: "View Full Portfolio",
    expandedText: "Show Less",
  });

  initExpandableSection({
    gridId: "certificationsGrid",
    btnId: "certificationsExpandBtn",
    wrapperId: "certificationsExpandWrapper",
    itemSelector: ".cert-card",
    maxVisible: 3,
    collapsedClass: "certifications__grid--collapsed",
    collapsedText: "View All Credentials",
    expandedText: "Show Less",
  });
  /* ═════════════════════════════════════════
     9. CLI LOGO TYPING ANIMATION
     ═════════════════════════════════════════ */
  (function initCliTyping() {
    var cliText = document.getElementById("cliText");
    var cliLogo = document.getElementById("cliLogo");
    if (!cliText || !cliLogo) return;

    var phrases = [
"Mohamed Yehia",
      "DevOps Engineer",
      "Cloud Systems",
      "CI/CD Automation",
      "IaC Automation"
    ];


    var typeSpeed = 70;
    var eraseSpeed = 40;
    var pauseAfterType = 2000;
    var pauseAfterErase = 500;


    function sleep(ms) {
      return new Promise(function (resolve) {
        setTimeout(resolve, ms);
      });
    }

    async function typePhrase(text) {
      for (var i = 0; i < text.length; i++) {
        cliText.textContent = text.substring(0, i + 1);
        await sleep(typeSpeed);
      }
    }

    async function erasePhrase(text) {
      for (var i = text.length; i > 0; i--) {
        cliText.textContent = text.substring(0, i - 1);
        await sleep(eraseSpeed);
      }
    }

    async function loop() {
      while (true) {
        for (var p = 0; p < phrases.length; p++) {
          await typePhrase(phrases[p]);
          await sleep(pauseAfterType);
          await erasePhrase(phrases[p]);
          await sleep(pauseAfterErase);
        }
      }
    }

    loop();
  })();
})();
