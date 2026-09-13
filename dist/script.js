document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const range = (value, start, end) =>
  clamp((value - start) / Math.max(0.001, end - start));

const revealObserver = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    }),
  { threshold: 0.1, rootMargin: "0px 0px -5% 0px" },
);
document
  .querySelectorAll(".reveal")
  .forEach((element) => revealObserver.observe(element));

document.querySelectorAll("[data-carousel-shell]").forEach((shell) => {
  const section = shell.parentElement;
  const track = shell.querySelector("[data-carousel-track]");
  const previous = section.querySelector("[data-carousel-prev]");
  const next = section.querySelector("[data-carousel-next]");
  if (!track || !previous || !next) return;

  const updateControls = () => {
    const remaining = track.scrollWidth - track.clientWidth - track.scrollLeft;
    previous.disabled = track.scrollLeft < 4;
    next.disabled = remaining < 4;
  };
  const move = (direction) => {
    track.scrollBy({
      left: direction * track.clientWidth * 0.78,
      behavior: reducedMotion.matches ? "auto" : "smooth",
    });
  };

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));
  track.addEventListener("scroll", updateControls, { passive: true });
  window.addEventListener("resize", updateControls);
  updateControls();
});

const header = document.querySelector("[data-header]");
const hero = document.querySelector("[data-sky-hero]");
const heroFrame = document.querySelector("[data-sky-frame]");
const packageSection = document.querySelector("[data-package-section]");
const packageFrame = document.querySelector("[data-package-frame]");
const transformSection = document.querySelector("[data-transform-section]");
const transformSticky = transformSection.querySelector(".transform-sticky");
const transformCopy = document.querySelector("[data-transform-copy]");
const cssBallFallback = document.querySelector(".css-ball-fallback");
const pillRain = [...document.querySelectorAll("[data-pill-rain] i")];
const vesselStage = document.querySelector(".vessel-stage");
const storyCards = [...document.querySelectorAll("[data-story-card]")];
const storyCardRail = document.querySelector("[data-story-cards]");
const footer = document.querySelector(".site-footer");
const footerMark = document.querySelector(".footer-mark");
let lastTransformScene = "";
let transformProgress = 0;
let ticking = false;
const smooth = (value) => value * value * (3 - 2 * value);

function updateScrollScene() {
  ticking = false;
  const viewport = window.innerHeight;
  const heroRect = hero.getBoundingClientRect();
  const heroTravel = Math.max(1, hero.offsetHeight - viewport);
  const heroProgress = clamp(-heroRect.top / heroTravel);
  const maxInset = window.innerWidth < 720 ? 14 : 28;
  const inset = heroProgress * maxInset;
  heroFrame.style.setProperty("--hero-inset", `${inset.toFixed(2)}px`);
  heroFrame.style.setProperty(
    "--hero-radius",
    `${(heroProgress * (window.innerWidth < 720 ? 26 : 38)).toFixed(2)}px`,
  );
  heroFrame.classList.toggle("is-card", heroProgress > 0.08);
  header.classList.toggle("scrolled", window.scrollY > 50);

  if (packageSection && packageFrame) {
    const packageRect = packageSection.getBoundingClientRect();
    const packageTravel = Math.max(1, packageSection.offsetHeight - viewport);
    const packageRaw = clamp(-packageRect.top / packageTravel);
    const packageImageProgress = smooth(range(packageRaw, 0.06, 0.74));
    const packageCopyProgress = smooth(range(packageRaw, 0.36, 0.66));
    const gutter =
      window.innerWidth < 900
        ? 18
        : 48;
    const fullWidth = Math.max(
      280,
      Math.min(1360, window.innerWidth - gutter * 2),
    );
    const finalWidth =
      window.innerWidth < 900
        ? fullWidth
        : Math.max(420, window.innerWidth * 0.5 - gutter);
    const finalCenter =
      window.innerWidth < 900
        ? window.innerWidth / 2
        : window.innerWidth - gutter - finalWidth / 2;
    const imageX = (finalCenter - window.innerWidth / 2) * packageImageProgress;
    const imageWidth =
      fullWidth + (finalWidth - fullWidth) * packageImageProgress;

    packageSection.style.setProperty(
      "--package-media-width",
      `${imageWidth.toFixed(2)}px`,
    );
    packageSection.style.setProperty(
      "--package-media-x",
      `${imageX.toFixed(2)}px`,
    );
    packageSection.style.setProperty(
      "--package-copy-opacity",
      packageCopyProgress.toFixed(3),
    );
    packageSection.style.setProperty(
      "--package-copy-y",
      `${(30 * (1 - packageCopyProgress)).toFixed(2)}px`,
    );
  }

  const transformRect = transformSection.getBoundingClientRect();
  const transformTravel = Math.max(1, transformSection.offsetHeight - viewport);
  const progress = clamp(-transformRect.top / transformTravel);
  transformProgress = progress;
  const copyExit = smooth(range(progress, 0.14, 0.23));
  transformCopy.style.setProperty("--copy-opacity", String(1 - copyExit));
  transformCopy.style.setProperty("--copy-y", `${-45 * copyExit}px`);

  const pillProgress = range(progress, 0.3, 0.47);
  const bottleEnter = smooth(range(progress, 0.23, 0.3));
  const bottleShift = smooth(range(progress, 0.48, 0.55));
  const bottleExit = smooth(range(progress, 0.96, 1));
  const cardsEnter = smooth(range(progress, 0.5, 0.56));
  const prepToRally = smooth(range(progress, 0.68, 0.74));
  const rallyToReset = smooth(range(progress, 0.84, 0.9));

  transformSticky.style.setProperty(
    "--cup-opacity",
    String(bottleEnter * (1 - bottleExit)),
  );
  transformSticky.style.setProperty(
    "--cup-left",
    `${50 - bottleShift * 27}%`,
  );
  transformSticky.style.setProperty(
    "--cards-in",
    String(cardsEnter),
  );
  transformSticky.style.setProperty(
    "--cards-shift",
    `${46 * (1 - cardsEnter)}px`,
  );
  transformSticky.style.setProperty(
    "--media-prep",
    String(cardsEnter * (1 - prepToRally)),
  );
  transformSticky.style.setProperty(
    "--media-rally",
    String(prepToRally * (1 - rallyToReset)),
  );
  transformSticky.style.setProperty("--media-reset", String(rallyToReset));

  const scene =
    progress < 0.5
      ? "intro"
      : progress < 0.68
        ? "prep"
        : progress < 0.84
          ? "rally"
          : "reset";
  transformSticky.dataset.scene = scene;

  if (scene !== lastTransformScene) {
    lastTransformScene = scene;
    storyCards.forEach((card) => {
      const active = reducedMotion.matches || card.dataset.storyCard === scene;
      const trigger = card.querySelector("[data-story-jump]");
      const body = card.querySelector(".story-card__body");
      card.classList.toggle("is-active", active);
      trigger.setAttribute("aria-expanded", String(active));
      if (active) trigger.setAttribute("aria-current", "step");
      else trigger.removeAttribute("aria-current");
      body.setAttribute("aria-hidden", String(!active));
    });
  }

  pillRain.forEach((pill, index) => {
    const start = index * 0.028;
    const local = smooth(range(pillProgress, start, start + 0.52));
    const entryX = Number.parseFloat(pill.style.getPropertyValue("--pill-x")) || 0;
    const restX = Number.parseFloat(pill.style.getPropertyValue("--rest-x")) || entryX;
    const restY = Number.parseFloat(pill.style.getPropertyValue("--rest-y")) || 0;
    const currentX = entryX + (restX - entryX) * local;
    pill.style.setProperty("--fall", local.toFixed(3));
    pill.style.setProperty("--pill-current-x", `${currentX.toFixed(2)}px`);
    pill.style.setProperty(
      "--fall-y",
      `${(local * (viewport * 0.55 + restY)).toFixed(2)}px`,
    );
    pill.style.setProperty("--pill-scale", (1 - local * 0.08).toFixed(3));
    pill.style.setProperty("--pill-opacity", local < 0.03 ? "0" : "1");
  });

  const fallbackArrival = smooth(range(progress, 0.03, 0.24));
  const fallbackSurface = smooth(range(progress, 0.12, 0.28));
  const fallbackShrink = smooth(range(progress, 0.14, 0.3));
  const fallbackDrop = smooth(range(progress, 0.3, 0.44));
  cssBallFallback.style.setProperty(
    "--fallback-x",
    `${64 - fallbackArrival * 14}%`,
  );
  cssBallFallback.style.setProperty(
    "--fallback-y",
    `${42 - fallbackArrival * 25 + fallbackDrop * 57}%`,
  );
  cssBallFallback.style.setProperty(
    "--fallback-scale",
    String(1.06 - fallbackShrink * 0.93),
  );
  cssBallFallback.style.setProperty(
    "--fallback-felt",
    String(0.58 * (1 - fallbackSurface)),
  );
  cssBallFallback.style.setProperty(
    "--fallback-saturation",
    String(1.08 - fallbackSurface * 0.38),
  );
  cssBallFallback.style.setProperty(
    "--fallback-color",
    fallbackSurface > 0.55 ? "#d8ff35" : "#c8ff22",
  );

  window.dispatchEvent(
    new CustomEvent("bend:transform", { detail: { progress } }),
  );

  const footerRect = footer.getBoundingClientRect();
  const footerProgress = reducedMotion.matches
    ? 0
    : clamp((viewport - footerRect.top) / Math.max(1, footerRect.height));
  const footerBend = smooth(range(footerProgress, 0.08, 0.88));
  const dotPhase = range(footerProgress, 0.55, 1);
  const dotBounce =
    dotPhase < 0.72
      ? Math.sin((dotPhase / 0.72) * Math.PI)
      : Math.sin(((dotPhase - 0.72) / 0.28) * Math.PI) * 0.24;
  const dotTravel = Math.min(92, viewport * 0.12);

  footerMark.style.setProperty("--footer-bend", footerBend.toFixed(3));
  footerMark.style.setProperty(
    "--footer-dot-y",
    `${(-dotBounce * dotTravel).toFixed(2)}px`,
  );
}

const storyTargets = { prep: 0.58, rally: 0.76, reset: 0.91 };
storyCardRail.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-story-jump]");
  if (!trigger) return;
  const sectionRect = transformSection.getBoundingClientRect();
  const sectionTop = window.scrollY + sectionRect.top;
  const travel = Math.max(1, transformSection.offsetHeight - window.innerHeight);
  window.scrollTo({
    top: sectionTop + storyTargets[trigger.dataset.storyJump] * travel,
    behavior: reducedMotion.matches ? "auto" : "smooth",
  });
});

transformSticky.addEventListener("pointermove", (event) => {
  if (reducedMotion.matches || transformProgress < 0.42 || transformProgress > 0.96)
    return;
  const rect = transformSticky.getBoundingClientRect();
  const x = clamp((event.clientX - rect.left) / rect.width, 0, 1) - 0.5;
  const y = clamp((event.clientY - rect.top) / rect.height, 0, 1) - 0.5;
  vesselStage.style.setProperty("--pointer-x", `${(x * 16).toFixed(2)}px`);
  vesselStage.style.setProperty("--pointer-y", `${(y * 12).toFixed(2)}px`);
  vesselStage.style.setProperty("--pointer-rotate", `${(x * 4).toFixed(2)}deg`);
});
transformSticky.addEventListener("pointerleave", () => {
  vesselStage.style.setProperty("--pointer-x", "0px");
  vesselStage.style.setProperty("--pointer-y", "0px");
  vesselStage.style.setProperty("--pointer-rotate", "0deg");
});

function queueScrollUpdate() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(updateScrollScene);
}
window.addEventListener("scroll", queueScrollUpdate, { passive: true });
window.addEventListener("resize", queueScrollUpdate);
updateScrollScene();

document.querySelectorAll("[data-spotlight]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  });
});

const menuButton = document.querySelector(".menu-button");
const mobileNav = document.querySelector("#mobileNav");
function setMobileMenu(open) {
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileNav.hidden = !open;
}
menuButton.addEventListener("click", () =>
  setMobileMenu(menuButton.getAttribute("aria-expanded") !== "true"),
);
mobileNav
  .querySelectorAll("a")
  .forEach((link) =>
    link.addEventListener("click", () => setMobileMenu(false)),
  );

const appPreview = document.querySelector("[data-app-preview]");
const appOnboarding = document.querySelector("[data-app-onboarding]");
const appDashboard = document.querySelector("[data-app-dashboard]");
const appStartButtons = [...document.querySelectorAll("[data-app-start]")];
const appResetButton = document.querySelector("[data-app-reset]");
const sportButtons = [...document.querySelectorAll("[data-sport]")];
const doseButtons = [...document.querySelectorAll("[data-dose]")];
const appDoseCount = document.querySelector("#appDoseCount");
const appSupplyCount = document.querySelector("#appSupplyCount");
const appSportName = document.querySelector("#appSportName");
const appNextMatch = document.querySelector("#appNextMatch");
const appReadiness = document.querySelector("#appReadiness");
const appReadinessNote = document.querySelector("#appReadinessNote");
const appHydration = document.querySelector("#appHydration");
const appCourtLoad = document.querySelector("#appCourtLoad");
const appMatchType = document.querySelector("#appMatchType");
const appMovementLabel = document.querySelector("#appMovementLabel");
const appMovement = document.querySelector("#appMovement");
const appMovementNote = document.querySelector("#appMovementNote");

const sportMetrics = {
  padel: {
    name: "padel.",
    next: "Next match / 19:30",
    readiness: "84",
    readinessNote: "High-intensity play",
    hydration: "1.2",
    courtLoad: "72",
    matchType: "Padel / doubles",
    movementLabel: "Explosive moves",
    movement: "46",
    movementNote: "Short accelerations",
  },
  tennis: {
    name: "tennis.",
    next: "Next match / Sat 11:00",
    readiness: "78",
    readinessNote: "Serve load elevated",
    hydration: "1.5",
    courtLoad: "96",
    matchType: "Tennis / singles",
    movementLabel: "Serve load",
    movement: "63",
    movementNote: "First + second serves",
  },
};

function setAppView(showDashboard) {
  appOnboarding.hidden = showDashboard;
  appDashboard.hidden = !showDashboard;
  appPreview.classList.toggle("dashboard-open", showDashboard);
  if (showDashboard)
    appPreview.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "center",
    });
}
function setSportMetrics(sport) {
  const metrics = sportMetrics[sport];
  if (!metrics) return;

  sportButtons.forEach((button) =>
    button.setAttribute("aria-pressed", String(button.dataset.sport === sport)),
  );
  appSportName.textContent = metrics.name;
  appNextMatch.textContent = metrics.next;
  appReadiness.textContent = metrics.readiness;
  appReadinessNote.textContent = metrics.readinessNote;
  appHydration.textContent = metrics.hydration;
  appCourtLoad.textContent = metrics.courtLoad;
  appMatchType.textContent = metrics.matchType;
  appMovementLabel.textContent = metrics.movementLabel;
  appMovement.textContent = metrics.movement;
  appMovementNote.textContent = metrics.movementNote;
}
function updateDoseLog() {
  const logged = doseButtons.filter(
    (button) => button.getAttribute("aria-pressed") === "true",
  ).length;
  appDoseCount.textContent = `${logged} / 3 logged`;
  appSupplyCount.textContent = logged === 3 ? "07" : "08";
}
appStartButtons.forEach((button) =>
  button.addEventListener("click", () => setAppView(true)),
);
appResetButton.addEventListener("click", () => setAppView(false));
sportButtons.forEach((button) =>
  button.addEventListener("click", () => setSportMetrics(button.dataset.sport)),
);
doseButtons.forEach((button) =>
  button.addEventListener("click", () => {
    const active = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!active));
    button.querySelector("i").textContent = active ? "+" : "\u2713";
    updateDoseLog();
  }),
);

const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 2400);
}
document
  .querySelector("[data-refill-review]")
  .addEventListener("click", () =>
    showToast("Nothing ships until you review the date and price"),
  );

const refillPlan = document.querySelector("#refillPlan");
const refillSummary = document.querySelector("#refillSummary");
if (refillPlan && refillSummary) {
  refillPlan.addEventListener("change", () => {
    refillSummary.textContent = refillPlan.checked
      ? "Refills follow logged play. You review the date and EUR 39 price before anything ships."
      : "Start with the first package only. Add refills when your match rhythm is clear.";
  });
}

const quantityValue = document.querySelector("#quantityValue");
const cartPrice = document.querySelector("#cartPrice");
let quantity = 1;
const updatePrice = () => {
  if (cartPrice) cartPrice.textContent = `EUR ${79 * quantity}`;
  if (quantityValue) quantityValue.textContent = String(quantity);
};
const quantityMinus = document.querySelector("[data-quantity-minus]");
const quantityPlus = document.querySelector("[data-quantity-plus]");
if (quantityMinus) {
  quantityMinus.addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    updatePrice();
  });
}
if (quantityPlus) {
  quantityPlus.addEventListener("click", () => {
    quantity = Math.min(8, quantity + 1);
    updatePrice();
  });
}

const cartDrawer = document.querySelector("#cartDrawer");
const cartButton = document.querySelector(".cart-button");
const drawerBackdrop = document.querySelector(".drawer-backdrop");
const drawerEmpty = document.querySelector("#drawerEmpty");
const drawerItems = document.querySelector("#drawerItems");
const drawerTotal = document.querySelector("#drawerTotal");
const drawerPrice = document.querySelector("#drawerPrice");
const cartCount = document.querySelector("#cartCount");
let cart = [];
function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  cartDrawer.inert = false;
  cartButton.setAttribute("aria-expanded", "true");
  drawerBackdrop.hidden = false;
  document.body.classList.add("no-scroll");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.inert = true;
  cartButton.setAttribute("aria-expanded", "false");
  drawerBackdrop.hidden = true;
  document.body.classList.remove("no-scroll");
}
function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartCount.textContent = String(count);
  drawerEmpty.hidden = cart.length > 0;
  drawerItems.hidden = cart.length === 0;
  drawerTotal.hidden = cart.length === 0;
  drawerPrice.textContent = `EUR ${total}`;
  drawerItems.innerHTML = cart
    .map(
      (item, index) =>
        `<article class="drawer-item"><div class="drawer-item-mark">01</div><div><strong>${item.name}</strong><small>${item.mode} / Qty ${item.quantity}</small></div><button type="button" data-remove-item="${index}">Remove</button></article>`,
    )
    .join("");
  drawerItems.querySelectorAll("[data-remove-item]").forEach((button) =>
    button.addEventListener("click", () => {
      cart.splice(Number(button.dataset.removeItem), 1);
      renderCart();
    }),
  );
}
cartButton.addEventListener("click", openCart);
drawerBackdrop.addEventListener("click", closeCart);
document
  .querySelectorAll("[data-close-cart]")
  .forEach((el) => el.addEventListener("click", closeCart));
const addToCartButton = document.querySelector("#addToCart");
if (addToCartButton) {
  addToCartButton.addEventListener("click", () => {
    cart.push({
      name: "BEND Match Stack",
      mode: refillPlan?.checked
        ? "first package + refill subscription review"
        : "first package only",
      price: 79,
      quantity,
    });
    renderCart();
    showToast("Match Stack added to cart");
    openCart();
  });
}
document
  .querySelector("#checkoutButton")
  .addEventListener("click", () =>
    showToast("Checkout opens with the first BEND release"),
  );
document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeCart();
  setMobileMenu(false);
});
