(() => {
  "use strict";

  // ==========================================================
  // AURA EVENT CONFIGURATION
  // ==========================================================
  // Replace these placeholders with the values from your EmailJS
  // dashboard. The public key is intended for browser-side use.
  const EMAILJS_CONFIG = {
    PUBLIC_KEY: "YOUR_PUBLIC_KEY",
    SERVICE_ID: "YOUR_SERVICE_ID",
    TEMPLATE_ID: "YOUR_TEMPLATE_ID"
  };

  const DOM = {
    header: document.querySelector(".site-header"),
    menuToggle: document.querySelector(".menu-toggle"),
    mobileNav: document.querySelector(".mobile-nav"),
    navLinks: [...document.querySelectorAll(".nav-link, .mobile-nav-link")],
    goButtons: [...document.querySelectorAll("[data-go]")],
    sections: [...document.querySelectorAll(".slide")],
    lightbox: document.querySelector("#lightbox"),
    lightboxImage: document.querySelector("#lightboxImage"),
    lightboxTitle: document.querySelector("#lightboxTitle"),
    lightboxCounter: document.querySelector("#lightboxCounter"),
    lightboxClose: document.querySelector("#lightboxClose"),
    lightboxPrev: document.querySelector("#lightboxPrev"),
    lightboxNext: document.querySelector("#lightboxNext"),
    galleryCards: [...document.querySelectorAll(".gallery-card")],
    reviewCards: [...document.querySelectorAll(".review-card")],
    reviewDots: [...document.querySelectorAll(".review-dot")],
    reviewPrev: document.querySelector(".carousel-control--prev"),
    reviewNext: document.querySelector(".carousel-control--next"),
    eventForm: document.querySelector("#eventForm"),
    submitButton: document.querySelector("#submitButton"),
    eventDate: document.querySelector("#eventDate"),
    guests: document.querySelector("#guests"),
    formStatus: document.querySelector("#formStatus"),
    successPanel: document.querySelector("#successPanel"),
    newEnquiryButton: document.querySelector("#newEnquiryButton"),
    siteToast: document.querySelector("#siteToast")
  };

  const gallery = DOM.galleryCards.map((card) => ({
    title: card.dataset.title,
    image: card.dataset.image,
    alt: card.querySelector("img")?.alt || card.dataset.title
  }));

  let lightboxIndex = 0;
  let reviewIndex = 0;
  let reviewTimer = null;
  let toastTimer = null;
  let lastFocusedElement = null;

  // ==========================================================
  // HELPERS
  // ==========================================================
  const isEmailConfigured = () =>
    EMAILJS_CONFIG.PUBLIC_KEY !== "YOUR_PUBLIC_KEY" &&
    EMAILJS_CONFIG.SERVICE_ID !== "YOUR_SERVICE_ID" &&
    EMAILJS_CONFIG.TEMPLATE_ID !== "YOUR_TEMPLATE_ID";

  const getLocalISODate = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const showToast = (message) => {
    DOM.siteToast.textContent = message;
    DOM.siteToast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      DOM.siteToast.classList.remove("is-visible");
    }, 3800);
  };

  const navigateTo = (sectionId) => {
    const target = document.getElementById(sectionId);
    if (!target) return;

    target.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });

    closeMobileNav();
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================
  DOM.navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      navigateTo(link.dataset.slide);
    });
  });

  DOM.goButtons.forEach((button) => {
    button.addEventListener("click", () => navigateTo(button.dataset.go));
  });

  const setActiveNav = (id) => {
    DOM.navLinks.forEach((link) => {
      const active = link.dataset.slide === id;
      link.classList.toggle("is-active", active);
    });
  };

 const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      setActiveNav(entry.target.dataset.section);
      entry.target.classList.add("is-visible");
    });
  },
  {
    threshold: 0.10
  }
);

  DOM.sections.forEach((section) => sectionObserver.observe(section));

  // Initial visibility for hero.
  document.querySelector("#home")?.classList.add("is-visible");

  // ==========================================================
  // MOBILE MENU
  // ==========================================================
  const openMobileNav = () => {
    DOM.menuToggle.classList.add("is-open");
    DOM.mobileNav.classList.add("is-open");
    DOM.mobileNav.setAttribute("aria-hidden", "false");
    DOM.menuToggle.setAttribute("aria-expanded", "true");
  };

  const closeMobileNav = () => {
    DOM.menuToggle.classList.remove("is-open");
    DOM.mobileNav.classList.remove("is-open");
    DOM.mobileNav.setAttribute("aria-hidden", "true");
    DOM.menuToggle.setAttribute("aria-expanded", "false");
  };

  DOM.menuToggle.addEventListener("click", () => {
    const open = DOM.menuToggle.getAttribute("aria-expanded") === "true";
    open ? closeMobileNav() : openMobileNav();
  });

  document.addEventListener("click", (event) => {
    if (!DOM.header.contains(event.target)) closeMobileNav();
  });

  // ==========================================================
  // HERO GENTLE ENTER ANIMATION
  // ==========================================================
  requestAnimationFrame(() => {
    document.body.classList.add("page-ready");
  });

  // ==========================================================
  // IMAGE LIGHTBOX
  // ==========================================================
  const renderLightbox = () => {
    const item = gallery[lightboxIndex];
    if (!item) return;

    DOM.lightboxImage.src = item.image;
    DOM.lightboxImage.alt = item.alt;
    DOM.lightboxTitle.textContent = item.title;
    DOM.lightboxCounter.textContent =
      `${String(lightboxIndex + 1).padStart(2, "0")} / ${String(gallery.length).padStart(2, "0")}`;
  };

  const openLightbox = (index) => {
    lastFocusedElement = document.activeElement;
    lightboxIndex = index;
    renderLightbox();
    DOM.lightbox.classList.add("is-open");
    DOM.lightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    DOM.lightboxClose.focus();
  };

  const closeLightbox = () => {
    DOM.lightbox.classList.remove("is-open");
    DOM.lightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-locked");
    if (lastFocusedElement instanceof HTMLElement) lastFocusedElement.focus();
  };

  const showGalleryStep = (step) => {
    lightboxIndex = (lightboxIndex + step + gallery.length) % gallery.length;
    renderLightbox();
  };

  DOM.galleryCards.forEach((card) => {
    card.addEventListener("click", () => openLightbox(Number(card.dataset.index)));
  });

  DOM.lightboxClose.addEventListener("click", closeLightbox);
  DOM.lightboxPrev.addEventListener("click", () => showGalleryStep(-1));
  DOM.lightboxNext.addEventListener("click", () => showGalleryStep(1));

  DOM.lightbox.addEventListener("click", (event) => {
    if (event.target === DOM.lightbox) closeLightbox();
  });

  document.addEventListener("keydown", (event) => {
    if (!DOM.lightbox.classList.contains("is-open")) return;

    if (event.key === "Escape") closeLightbox();
    if (event.key === "ArrowLeft") showGalleryStep(-1);
    if (event.key === "ArrowRight") showGalleryStep(1);
  });

  // ==========================================================
  // TESTIMONIAL CAROUSEL
  // ==========================================================
  const renderReview = (nextIndex, direction = 1) => {
    reviewIndex = (nextIndex + DOM.reviewCards.length) % DOM.reviewCards.length;

    DOM.reviewCards.forEach((card, index) => {
      card.classList.toggle("is-current", index === reviewIndex);
    });

    DOM.reviewDots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === reviewIndex);
    });

    DOM.reviewCards.forEach((card, index) => {
      card.style.transform =
        index === reviewIndex
          ? "translateX(0) scale(1)"
          : `translateX(${direction * 26}px) scale(.985)`;
    });
  };

  const startReviewTimer = () => {
    window.clearInterval(reviewTimer);
    reviewTimer = window.setInterval(() => {
      renderReview(reviewIndex + 1, 1);
    }, 7000);
  };

  const stopReviewTimer = () => {
    window.clearInterval(reviewTimer);
  };

  DOM.reviewPrev.addEventListener("click", () => {
    renderReview(reviewIndex - 1, -1);
    startReviewTimer();
  });

  DOM.reviewNext.addEventListener("click", () => {
    renderReview(reviewIndex + 1, 1);
    startReviewTimer();
  });

  DOM.reviewDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      const direction = index >= reviewIndex ? 1 : -1;
      renderReview(index, direction);
      startReviewTimer();
    });
  });

  const reviewStage = document.querySelector(".review-stage");
  reviewStage.addEventListener("mouseenter", stopReviewTimer);
  reviewStage.addEventListener("mouseleave", startReviewTimer);
  renderReview(0, 1);
  startReviewTimer();

  // ==========================================================
  // DYNAMIC EVENT DATE
  // ==========================================================
  const setMinimumEventDate = () => {
    if (!DOM.eventDate) return;
    const today = getLocalISODate();
    DOM.eventDate.min = today;
  };

  setMinimumEventDate();

  // Keep today's value fresh if the browser remains open across midnight.
  window.setInterval(setMinimumEventDate, 60000);

  // ==========================================================
  // FORM VALIDATION
  // ==========================================================
  const FIELD_RULES = {
    fullName: (value) => value.trim().length >= 2 ? "" : "Please enter your full name.",
    phone: (value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 ? "" : "Please enter a valid phone number.";
    },
    email: (value) => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailPattern.test(value.trim()) ? "" : "Please enter a valid email address.";
    },
    eventType: (value) => value ? "" : "Please select an event type.",
    eventDate: (value) => {
      if (!value) return "Please select an event date.";
      const today = getLocalISODate();
      return value < today ? "Please select today or a future event date." : "";
    },
    guests: (value) => {
      const guests = Number(value);
      return Number.isInteger(guests) && guests >= 1 ? "" : "Guests must be at least 1.";
    },
    budget: (value) => value ? "" : "Please select a budget range."
  };

  const setFieldError = (id, message) => {
    const input = document.getElementById(id);
    const field = input?.closest(".field");
    const error = document.querySelector(`[data-error-for="${id}"]`);

    field?.classList.toggle("has-error", Boolean(message));
    error.textContent = message || "";

    if (message) {
      field?.classList.add("shake");
      window.setTimeout(() => field?.classList.remove("shake"), 380);
    }
  };

  const clearFieldError = (id) => setFieldError(id, "");

  Object.keys(FIELD_RULES).forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;

    input.addEventListener("blur", () => {
      const message = FIELD_RULES[id](input.value);
      setFieldError(id, message);
    });

    input.addEventListener("input", () => {
      if (!input.closest(".field")?.classList.contains("has-error")) return;
      const message = FIELD_RULES[id](input.value);
      setFieldError(id, message);
    });

    input.addEventListener("change", () => {
      const message = FIELD_RULES[id](input.value);
      setFieldError(id, message);
    });
  });

  DOM.guests.addEventListener("input", () => {
    DOM.guests.value = DOM.guests.value.replace(/[^\d]/g, "");
    if (Number(DOM.guests.value) < 1 && DOM.guests.value !== "") {
      DOM.guests.value = "";
    }
  });

  const validateForm = () => {
    let firstInvalid = null;
    let valid = true;

    Object.entries(FIELD_RULES).forEach(([id, rule]) => {
      const input = document.getElementById(id);
      const message = rule(input.value);
      setFieldError(id, message);

      if (message && !firstInvalid) firstInvalid = input;
      if (message) valid = false;
    });

    if (!valid && firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    return valid;
  };

  const setFormStatus = (message = "", type = "") => {
    DOM.formStatus.textContent = message;
    DOM.formStatus.className = "form-status";
    if (type) DOM.formStatus.classList.add(`is-${type}`);
  };

  const showSuccess = () => {
    DOM.eventForm.hidden = true;
    DOM.successPanel.hidden = false;
  };

  const resetFormToNewEnquiry = () => {
    DOM.eventForm.reset();
    DOM.eventForm.hidden = false;
    DOM.successPanel.hidden = true;
    setFormStatus("");
    Object.keys(FIELD_RULES).forEach(clearFieldError);
    setMinimumEventDate();
    DOM.eventDate.focus();
  };

  DOM.newEnquiryButton.addEventListener("click", resetFormToNewEnquiry);

  // ==========================================================
  // EMAILJS SUBMISSION
  // ==========================================================
  const initEmailJS = () => {
    if (!window.emailjs || !isEmailConfigured()) return false;

    try {
      emailjs.init({
        publicKey: EMAILJS_CONFIG.PUBLIC_KEY
      });
      return true;
    } catch (error) {
      console.error("EmailJS initialization failed:", error);
      return false;
    }
  };

  initEmailJS();

  DOM.eventForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    setFormStatus("");

    if (!validateForm()) {
      setFormStatus("Please correct the highlighted fields and try again.", "error");
      return;
    }

    const today = getLocalISODate();
    if (DOM.eventDate.value < today) {
      setFieldError("eventDate", "Please select today or a future event date.");
      setFormStatus("Please correct the event date before submitting.", "error");
      return;
    }

    DOM.submitButton.classList.add("is-loading");
    DOM.submitButton.disabled = true;
    DOM.submitButton.querySelector(".button-arrow").textContent = "↻";

    if (!isEmailConfigured()) {
      setFormStatus(
        "Demo mode: your enquiry is valid, but EmailJS is not configured yet. Replace the three EmailJS placeholders in script.js to enable delivery.",
        "info"
      );
      DOM.submitButton.classList.remove("is-loading");
      DOM.submitButton.disabled = false;
      DOM.submitButton.querySelector(".button-arrow").textContent = "↗";
      showToast("EmailJS setup is required for live enquiry delivery.");
      return;
    }

    try {
      const result = await emailjs.sendForm(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        DOM.eventForm
      );

      console.info("EmailJS enquiry sent:", result?.status, result?.text);
      DOM.submitButton.querySelector(".button-arrow").textContent = "✓";
      setFormStatus("");
      showSuccess();
    } catch (error) {
      console.error("EmailJS enquiry failed:", error);
      setFormStatus(
        "We couldn't send the enquiry right now. Please verify the EmailJS settings or use the contact details on the Contact section.",
        "error"
      );
      showToast("Enquiry could not be sent. Please try again.");
    } finally {
      DOM.submitButton.classList.remove("is-loading");
      DOM.submitButton.disabled = false;
      DOM.submitButton.querySelector(".button-arrow").textContent = "↗";
    }
  });

  // ==========================================================
  // SMALL VISUAL POLISH
  // ==========================================================
  const heroVisual = document.querySelector(".hero-visual");
  if (heroVisual && window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
    heroVisual.addEventListener("mousemove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      const orbit = heroVisual.querySelector(".hero-orbit");
      const noteOne = heroVisual.querySelector(".floating-note--one");
      const noteTwo = heroVisual.querySelector(".floating-note--two");

      orbit.style.transform = `translate(${x * 12}px, ${y * 12}px) rotate(-18deg)`;
      noteOne.style.translate = `${x * -8}px ${y * -5}px`;
      noteTwo.style.translate = `${x * 8}px ${y * 6}px`;
    });

    heroVisual.addEventListener("mouseleave", () => {
      const orbit = heroVisual.querySelector(".hero-orbit");
      const noteOne = heroVisual.querySelector(".floating-note--one");
      const noteTwo = heroVisual.querySelector(".floating-note--two");

      orbit.style.transform = "translate(0,0) rotate(-18deg)";
      noteOne.style.translate = "0 0";
      noteTwo.style.translate = "0 0";
    });
  }

  // ==========================================================
  // ACCESSIBILITY: ESC CLOSES MOBILE NAV
  // ==========================================================
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileNav();
  });
})();
