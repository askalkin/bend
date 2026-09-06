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
const movement = document.querySelector(".movement");
const footer = document.querySelector(".site-footer");
const footerMark = document.querySelector(".footer-mark");

function updateScrollState() {
  header.classList.toggle("scrolled", window.scrollY > 40);
  if (movement) {
    const rect = movement.getBoundingClientRect();
    movement.classList.toggle("in-motion", rect.top < window.innerHeight * 0.78);
  }
  if (footer && footerMark) {
    const footerRect = footer.getBoundingClientRect();
    const progress = reducedMotion.matches ? 1 : Math.min(1, Math.max(0, (window.innerHeight - footerRect.top) / footerRect.height));
    footerMark.style.setProperty("--footer-bend", progress.toFixed(3));
  }
}

window.addEventListener("scroll", updateScrollState, { passive: true });
updateScrollState();

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
        <div class="drawer-item-image"><img src="assets/bend-rally-front.png" alt=""></div>
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

function makeCanvasResponsive(canvas, draw) {
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    const context = canvas.getContext("2d");
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(context, rect.width, rect.height, performance.now());
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  return resize;
}

const orbitCanvas = document.querySelector("#orbitCanvas");
let orbitSize = { width: 0, height: 0 };
let orbitFrame;

function drawOrbits(context, width, height, time) {
  orbitSize = { width, height };
  context.clearRect(0, 0, width, height);
  context.save();
  context.globalAlpha = 0.28;
  context.strokeStyle = "#ffffff";
  context.lineWidth = 1;
  const phase = reducedMotion.matches ? 0 : time * 0.00014;
  context.beginPath();
  context.ellipse(width * 0.31, height * 0.54, width * 0.28, height * 0.2, -0.42 + Math.sin(phase) * 0.025, 0, Math.PI * 2);
  context.stroke();
  context.globalAlpha = 0.18;
  context.beginPath();
  context.ellipse(width * 0.33, height * 0.54, width * 0.36, height * 0.27, -0.42, 0, Math.PI * 2);
  context.stroke();
  context.restore();
}

const resizeOrbits = makeCanvasResponsive(orbitCanvas, drawOrbits);

function animateOrbits(time) {
  const context = orbitCanvas.getContext("2d");
  drawOrbits(context, orbitSize.width, orbitSize.height, time);
  if (!reducedMotion.matches) orbitFrame = requestAnimationFrame(animateOrbits);
}

if (!reducedMotion.matches) orbitFrame = requestAnimationFrame(animateOrbits);

const curveCanvas = document.querySelector("#curveCanvas");
let curveSize = { width: 0, height: 0 };
let curveFrame;

function drawCurve(context, width, height, time) {
  curveSize = { width, height };
  context.clearRect(0, 0, width, height);
  const pulse = reducedMotion.matches ? 0 : Math.sin(time * 0.0014) * 3;
  const points = [
    [0, height * 0.77],
    [width * 0.23, height * 0.34],
    [width * 0.49, height * 0.53 + pulse],
    [width * 0.74, height * 0.21],
    [width, height * 0.38],
  ];
  context.save();
  context.strokeStyle = "rgba(10,11,10,.42)";
  context.lineWidth = 1.25;
  context.beginPath();
  context.moveTo(points[0][0], points[0][1]);
  context.bezierCurveTo(width * 0.1, height * 0.68, width * 0.12, height * 0.2, points[1][0], points[1][1]);
  context.bezierCurveTo(width * 0.34, height * 0.24, width * 0.38, height * 0.66, points[2][0], points[2][1]);
  context.bezierCurveTo(width * 0.59, height * 0.43, width * 0.63, height * 0.15, points[3][0], points[3][1]);
  context.bezierCurveTo(width * 0.84, height * 0.16, width * 0.9, height * 0.5, points[4][0], points[4][1]);
  context.stroke();

  points.forEach(([x, y], index) => {
    context.fillStyle = index === 2 ? "#c8ff22" : "rgba(255,255,255,.9)";
    context.beginPath();
    context.arc(x, y, index === 2 ? 5 : 3.5, 0, Math.PI * 2);
    context.fill();
  });
  context.restore();
}

makeCanvasResponsive(curveCanvas, drawCurve);

function animateCurve(time) {
  const context = curveCanvas.getContext("2d");
  drawCurve(context, curveSize.width, curveSize.height, time);
  if (!reducedMotion.matches) curveFrame = requestAnimationFrame(animateCurve);
}

if (!reducedMotion.matches) curveFrame = requestAnimationFrame(animateCurve);

reducedMotion.addEventListener("change", () => {
  cancelAnimationFrame(orbitFrame);
  cancelAnimationFrame(curveFrame);
  resizeOrbits();
  drawCurve(curveCanvas.getContext("2d"), curveSize.width, curveSize.height, performance.now());
  if (!reducedMotion.matches) {
    orbitFrame = requestAnimationFrame(animateOrbits);
    curveFrame = requestAnimationFrame(animateCurve);
  }
});
