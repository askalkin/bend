document.documentElement.classList.add("js");

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
);

document.querySelectorAll(".reveal:not(.in-view)").forEach((element) => revealObserver.observe(element));

const header = document.querySelector("[data-header]");
const footer = document.querySelector(".site-footer");
const footerMark = document.querySelector(".footer-mark");

function updateScrollState() {
  header.classList.toggle("scrolled", window.scrollY > 40);
  const footerRect = footer.getBoundingClientRect();
  const progress = reducedMotion.matches
    ? 1
    : Math.min(1, Math.max(0, (window.innerHeight - footerRect.top) / Math.max(1, footerRect.height * 0.72)));
  footerMark.style.setProperty("--footer-bend", progress.toFixed(3));
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

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

menuButton.addEventListener("click", () => setMobileMenu(menuButton.getAttribute("aria-expanded") !== "true"));
mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMobileMenu(false)));

const refillPlan = document.querySelector("#refillPlan");
const frequencyControl = document.querySelector("#frequencyControl");
const frequencyButtons = [...document.querySelectorAll("[data-frequency]")];
const deliveryInterval = document.querySelector("#deliveryInterval");
const refillSummary = document.querySelector("#refillSummary");
const quantityValue = document.querySelector("#quantityValue");
const cartPrice = document.querySelector("#cartPrice");
const unitPrice = 79;
let quantity = 1;
let frequency = 2;

const frequencyData = {
  2: { interval: "Refill forecast: about 5 weeks", summary: "Estimated first refill after 5 weeks. Review 30 doses for EUR 39 before payment." },
  3: { interval: "Refill forecast: about 4 weeks", summary: "Estimated first refill after 4 weeks. Review 30 doses for EUR 39 before payment." },
  5: { interval: "Refill forecast: about 2 weeks", summary: "Estimated first refill after 2 weeks. Review 30 doses for EUR 39 before payment." },
};

function updatePurchasePrice() {
  cartPrice.textContent = `EUR ${unitPrice * quantity}`;
}

refillPlan.addEventListener("change", () => {
  frequencyControl.hidden = !refillPlan.checked;
  refillSummary.textContent = refillPlan.checked
    ? frequencyData[frequency].summary
    : "One starter kit only. No future deliveries or recurring charges.";
});

frequencyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    frequency = Number(button.dataset.frequency);
    frequencyButtons.forEach((item) => item.classList.toggle("active", item === button));
    deliveryInterval.textContent = frequencyData[frequency].interval;
    refillSummary.textContent = frequencyData[frequency].summary;
  });
});

document.querySelector("[data-quantity-minus]").addEventListener("click", () => {
  quantity = Math.max(1, quantity - 1);
  quantityValue.textContent = String(quantity);
  updatePurchasePrice();
});

document.querySelector("[data-quantity-plus]").addEventListener("click", () => {
  quantity = Math.min(8, quantity + 1);
  quantityValue.textContent = String(quantity);
  updatePurchasePrice();
});

const cartDrawer = document.querySelector("#cartDrawer");
const bagButton = document.querySelector(".bag-button");
const drawerBackdrop = document.querySelector(".drawer-backdrop");
const drawerEmpty = document.querySelector("#drawerEmpty");
const drawerItems = document.querySelector("#drawerItems");
const drawerTotal = document.querySelector("#drawerTotal");
const drawerPrice = document.querySelector("#drawerPrice");
const cartCount = document.querySelector("#cartCount");
const toast = document.querySelector("#toast");
let cart = [];
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("visible"), 2200);
}

const appPreview = document.querySelector("[data-app-preview]");
const appOnboarding = document.querySelector("[data-app-onboarding]");
const appDashboard = document.querySelector("[data-app-dashboard]");
const appStartButtons = [...document.querySelectorAll("[data-app-start]")];
const appResetButton = document.querySelector("[data-app-reset]");
const trainingDays = [...document.querySelectorAll("[data-training-day]")];
const doseButtons = [...document.querySelectorAll("[data-dose]")];
const appSessionCount = document.querySelector("#appSessionCount");
const appDoseCount = document.querySelector("#appDoseCount");
const appSupplyCount = document.querySelector("#appSupplyCount");
const appRefillForecast = document.querySelector("#appRefillForecast");
const supplyMeter = document.querySelector(".supply-meter i");

function setAppView(dashboardOpen) {
  appPreview.classList.remove("switching");
  appOnboarding.hidden = dashboardOpen;
  appDashboard.hidden = !dashboardOpen;
  if (dashboardOpen) {
    void appDashboard.offsetWidth;
    appPreview.classList.add("switching");
    appResetButton.focus({ preventScroll: true });
  } else {
    appStartButtons.at(-1).focus({ preventScroll: true });
  }
}

function updateTrainingPlan() {
  const sessions = trainingDays.filter((button) => button.getAttribute("aria-pressed") === "true").length;
  appSessionCount.textContent = `${sessions} ${sessions === 1 ? "session" : "sessions"}`;
  if (sessions === 0) appRefillForecast.textContent = "Add a session to create a refill forecast.";
  else if (sessions <= 2) appRefillForecast.textContent = "Next refill ready to review 29 Sep.";
  else if (sessions <= 4) appRefillForecast.textContent = "Next refill ready to review 22 Sep.";
  else appRefillForecast.textContent = "Next refill ready to review 15 Sep.";
}

function updateDoseLog() {
  const logged = doseButtons.filter((button) => button.getAttribute("aria-pressed") === "true").length;
  appDoseCount.textContent = `${logged} / 3 logged`;
  appSupplyCount.textContent = logged === 3 ? "07" : "08";
  supplyMeter.style.width = logged === 3 ? "70%" : "80%";
}

appStartButtons.forEach((button) => button.addEventListener("click", () => setAppView(true)));
appResetButton.addEventListener("click", () => setAppView(false));

trainingDays.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!selected));
    if (selected) button.querySelector("i")?.remove();
    else button.append(document.createElement("i"));
    updateTrainingPlan();
  });
});

doseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const selected = button.getAttribute("aria-pressed") === "true";
    button.setAttribute("aria-pressed", String(!selected));
    button.querySelector("i").textContent = selected ? "+" : "\u2713";
    updateDoseLog();
  });
});

document.querySelector("[data-refill-review]").addEventListener("click", () => {
  showToast("Nothing ships until you review the date and price");
});

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  bagButton.setAttribute("aria-expanded", "true");
  drawerBackdrop.hidden = false;
  document.body.classList.add("no-scroll");
  cartDrawer.querySelector("[data-close-cart]").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  bagButton.setAttribute("aria-expanded", "false");
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
      (item, index) => `<article class="drawer-item">
        <div class="drawer-item-mark" aria-hidden="true">01</div>
        <div><strong>${item.name}</strong><small>${item.mode} / Qty ${item.quantity}</small></div>
        <button type="button" data-remove-item="${index}">Remove</button>
      </article>`,
    )
    .join("");
  drawerItems.querySelectorAll("[data-remove-item]").forEach((button) => {
    button.addEventListener("click", () => {
      cart.splice(Number(button.dataset.removeItem), 1);
      renderCart();
    });
  });
}

bagButton.addEventListener("click", openCart);
drawerBackdrop.addEventListener("click", closeCart);
document.querySelectorAll("[data-close-cart]").forEach((element) => element.addEventListener("click", closeCart));

document.querySelector("#addToBag").addEventListener("click", () => {
  cart.push({
    name: "BEND Starter Kit",
    mode: refillPlan.checked ? `complete kit + ${frequency}x weekly refill plan` : "complete kit only",
    price: unitPrice,
    quantity,
  });
  renderCart();
  showToast("Starter kit added to your bag");
  openCart();
});

document.querySelector("#checkoutButton").addEventListener("click", () => {
  showToast("Checkout will open with the first BEND release");
});

document.querySelectorAll(".faq-list article").forEach((item) => {
  const button = item.querySelector("button");
  const answer = item.querySelector(".faq-answer");
  button.addEventListener("click", () => {
    const open = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!open));
    answer.hidden = open;
  });
});

const formulaDialog = document.querySelector("#formulaDialog");

document.querySelectorAll(".dialog-open").forEach((button) => {
  button.addEventListener("click", () => formulaDialog.showModal());
});

formulaDialog.querySelector("[data-close-dialog]").addEventListener("click", () => formulaDialog.close());
formulaDialog.addEventListener("click", (event) => {
  const rect = formulaDialog.getBoundingClientRect();
  const inside = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
  if (!inside) formulaDialog.close();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  if (cartDrawer.classList.contains("open")) closeCart();
  if (!mobileNav.hidden) setMobileMenu(false);
});

document.querySelector("#newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  showToast("You are on the BEND court list");
  event.currentTarget.reset();
});
