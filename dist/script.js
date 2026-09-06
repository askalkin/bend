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
  2: { interval: "30 refills every 5 weeks", summary: "First refill: 30 doses for EUR 39 after 5 weeks. We remind you before it ships." },
  3: { interval: "30 refills every 4 weeks", summary: "First refill: 30 doses for EUR 39 after 4 weeks. We remind you before it ships." },
  5: { interval: "30 refills every 2 weeks", summary: "First refill: 30 doses for EUR 39 after 2 weeks. We remind you before it ships." },
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
