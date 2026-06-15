/**
 * RJN AUTOMOTIVE GROUP — index.js
 * Handles: Navbar scroll, Mobile menu, Search toggle,
 *          Scroll reveal, Metric count-up animation
 */

(function () {
  "use strict";

  /* ── DOM REFS ────────────────────────────────────────────── */
  const mainNav            = document.getElementById("mainNav");
  const mobileMenuToggle   = document.getElementById("mobileMenuToggle");
  const mobileMenu         = document.getElementById("mobileMenu");
  const searchBar          = document.getElementById("searchBar");
  const searchToggleDesk   = document.getElementById("searchToggleDesktop");
  const searchToggleMobile = document.getElementById("searchToggleMobile");
  const searchClose        = document.getElementById("searchClose");
  const revealTargets      = document.querySelectorAll(".rjn-reveal");

  /* ── 1. NAVBAR SCROLL STATE ───────────────────────────────── */
  function onNavScroll() {
    if (!mainNav) return;
    mainNav.classList.toggle("scrolled", window.scrollY > 20);
  }
  window.addEventListener("scroll", onNavScroll, { passive: true });
  onNavScroll();

  /* ── 2. MOBILE MENU TOGGLE ────────────────────────────────── */
  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener("click", function () {
      const isOpen = mobileMenu.classList.toggle("open");
      mobileMenuToggle.setAttribute("aria-expanded", isOpen);
      // Swap icon
      const icon = mobileMenuToggle.querySelector("i");
      if (icon) {
        icon.className = isOpen ? "bi bi-x-lg" : "bi bi-list";
      }
    });

    // Close mobile menu on link click
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobileMenu.classList.remove("open");
        mobileMenuToggle.setAttribute("aria-expanded", false);
        const icon = mobileMenuToggle.querySelector("i");
        if (icon) icon.className = "bi bi-list";
      });
    });
  }

  /* ── 3. SEARCH TOGGLE ─────────────────────────────────────── */
  function openSearch() {
    if (!searchBar) return;
    searchBar.classList.add("active");
    const input = searchBar.querySelector("input");
    if (input) setTimeout(function () { input.focus(); }, 50);
  }

  function closeSearch() {
    if (searchBar) searchBar.classList.remove("active");
  }

  if (searchToggleDesk)   searchToggleDesk.addEventListener("click", openSearch);
  if (searchToggleMobile) searchToggleMobile.addEventListener("click", openSearch);
  if (searchClose)        searchClose.addEventListener("click", closeSearch);

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeSearch();
  });

  /* ── 4. SCROLL REVEAL ─────────────────────────────────────── */
  if ("IntersectionObserver" in window && revealTargets.length > 0) {
    const revealObs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -36px 0px" }
    );
    revealTargets.forEach(function (el) { revealObs.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ── 5. METRIC COUNT-UP ───────────────────────────────────── */

  /**
   * Animate a single counter element from 0 → target.
   * The suffix (+ / M+ / %) is rendered in a sibling .metric-sfx span,
   * so it never moves. Only the .metric-num textContent changes.
   *
   * @param {HTMLElement} el      - the .metric-num element
   * @param {number}      target  - highest numeric value to reach
   * @param {number}      duration - ms (default 1800)
   */
  function animateCounter(el, target, duration) {
    duration = duration || 1800;
    var start     = null;
    var startVal  = 0;

    function step(timestamp) {
      if (!start) start = timestamp;
      var elapsed  = timestamp - start;
      var progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      var eased    = 1 - Math.pow(1 - progress, 3);
      var current  = Math.round(startVal + eased * (target - startVal));
      el.textContent = current;
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target; // guarantee exact final value
      }
    }

    requestAnimationFrame(step);
  }

  /**
   * Observe metric cards; fire count-up once visible.
   */
  function initCountUp() {
    var counters = document.querySelectorAll(".metric-num[data-target]");
    if (!counters.length) return;

    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var el     = entry.target;
              var target = parseInt(el.getAttribute("data-target"), 10);
              if (!isNaN(target)) {
                animateCounter(el, target, 1800);
              }
              observer.unobserve(el);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach(function (el) { obs.observe(el); });
    } else {
      // Fallback: set immediately
      counters.forEach(function (el) {
        var target = parseInt(el.getAttribute("data-target"), 10);
        if (!isNaN(target)) el.textContent = target;
      });
    }
  }

  /* ── 6. SMOOTH ANCHOR SCROLL ──────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var id = anchor.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var navH    = mainNav ? mainNav.offsetHeight : 0;
      var top     = target.getBoundingClientRect().top + window.scrollY - navH - 16;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  });

  /* ── 7. ACTIVE NAV HIGHLIGHTING ───────────────────────────── */
  var sections = document.querySelectorAll("section[id]");
  var navLinks = document.querySelectorAll(".rjn-link");

  function highlightNav() {
    var pos = window.scrollY + (mainNav ? mainNav.offsetHeight : 0) + 50;
    sections.forEach(function (sec) {
      var top    = sec.offsetTop;
      var bottom = top + sec.offsetHeight;
      var id     = sec.id;
      if (pos >= top && pos < bottom) {
        navLinks.forEach(function (link) {
          link.classList.remove("active");
          var href = link.getAttribute("href");
          if (href === "#" + id || (id === "hero" && href === "#")) {
            link.classList.add("active");
          }
        });
      }
    });
  }
  window.addEventListener("scroll", highlightNav, { passive: true });

  /* ── 8. BLOG CAROUSEL ─────────────────────────────────────── */

  /**
   * Responsive carousel: slides show 3 cards on desktop,
   * 2 on tablet (≥768px), 1 on mobile.
   * Navigation is driven by translateX on #blogTrack.
   */
  function initBlogCarousel() {
    const track    = document.getElementById("blogTrack");
    const prevBtn  = document.getElementById("blogPrev");
    const nextBtn  = document.getElementById("blogNext");
    const dotsWrap = document.getElementById("blogDots");

    // Bail out silently if the carousel markup is absent
    if (!track || !prevBtn || !nextBtn) return;

    const cards     = Array.from(track.querySelectorAll(".blog-card"));
    const totalCards = cards.length;
    if (totalCards === 0) return;

    let currentIndex = 0;

    /** How many cards are visible at the current viewport width */
    function getVisible() {
      const w = window.innerWidth;
      if (w >= 1024) return 3;
      if (w >= 768)  return 2;
      return 1;
    }

    /**
     * Move the track to show `index` as the first card.
     * Width of one card + gap is derived from the card's own
     * offsetWidth plus the CSS gap (1.25rem = 20px).
     */
    function goTo(index) {
      const visible   = getVisible();
      const maxIndex  = Math.max(0, totalCards - visible);
      currentIndex    = Math.max(0, Math.min(index, maxIndex));

      const cardWidth = cards[0].offsetWidth;
      const gap       = 20; // matches CSS gap: 1.25rem
      const offset    = currentIndex * (cardWidth + gap);

      track.style.transform = `translateX(-${offset}px)`;

      // Update dots
      if (dotsWrap) {
        const dots = dotsWrap.querySelectorAll(".blog-dot");
        dots.forEach(function (dot, i) {
          dot.classList.toggle("active", i === currentIndex);
        });
      }

      // Disable buttons at the extremes (optional UX nicety)
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex >= maxIndex;
    }

    // Button listeners
    prevBtn.addEventListener("click", function () {
      goTo(currentIndex - 1);
    });

    nextBtn.addEventListener("click", function () {
      goTo(currentIndex + 1);
    });

    // Dot listeners
    if (dotsWrap) {
      dotsWrap.querySelectorAll(".blog-dot").forEach(function (dot) {
        dot.addEventListener("click", function () {
          const idx = parseInt(dot.getAttribute("data-index"), 10);
          if (!isNaN(idx)) goTo(idx);
        });
      });
    }

    // Recalculate on resize so the pixel offset stays accurate
    window.addEventListener("resize", function () {
      goTo(currentIndex);
    }, { passive: true });

    // Initialise at position 0
    goTo(0);
  }

  /* ── 9. INIT ──────────────────────────────────────────────── */
  document.addEventListener("DOMContentLoaded", function () {
    // Immediately reveal hero content (above fold)
    document.querySelectorAll("#hero .rjn-reveal").forEach(function (el) {
      el.classList.add("visible");
    });

    // Start count-up engine
    initCountUp();

    // Start blog carousel
    initBlogCarousel();
  });

})();