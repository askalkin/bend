document.documentElement.classList.add("js");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const products = {
  prep: {
    stage: "Stage 01",
    timing: "20-30 min before play",
    name: "PREP",
    promise: "Arrive ready, not wired.",
    description:
      "A caffeine-free pre-game ball for evening players. One clean step before the first serve, with no shaker and no stimulant blend arguing with sleep later.",
    image: "assets/bend-prep-front.png",
    alt: "BEND PREP supplement container",
    facts: [
      ["Format", "1 chewable ball"],
      ["Direction", "B vitamins + magnesium"],
      ["Contains", "Zero caffeine / zero sugar"],
    ],
  },
  rally: {
    stage: "Stage 02",
    timing: "During play / between games",
    name: "RALLY",
    promise: "Hold pace through the long set.",
    description:
      "A clear-dissolving electrolyte ball for stop-start racquet sport. Drop one in your court bottle and drink between games while water still looks like water.",
    image: "assets/bend-rally-front.png",
    alt: "BEND RALLY supplement container",
    facts: [
      ["Format", "1 dissolvable ball"],
      ["Direction", "Sodium + potassium"],
      ["Mix", "500-1000 ml water"],
    ],
  },
  reset: {
    stage: "Stage 03",
    timing: "Within 30 min after play",
    name: "RESET",
    promise: "Tomorrow starts courtside.",
    description:
      "A post-match water ball that turns the walk off court into a recovery ritual. Mix it while you change, eat, and come down from the lights.",
    image: "assets/bend-reset-front.png",
    alt: "BEND RESET supplement container",
    facts: [
      ["Format", "1 dissolvable ball"],
      ["Direction", "Amino acids + tart cherry"],
      ["Support", "Vitamin C + magnesium"],
    ],
  },
};

const stageTabs = [...document.querySelectorAll(".stage-tab")];
const productPanel = document.querySelector("#productPanel");
const focusImage = document.querySelector("#focusProductImage");
const focusStage = document.querySelector("#focusStage");
const focusTiming = document.querySelector("#focusTiming");
const focusName = document.querySelector("#focusName");
const focusPromise = document.querySelector("#focusPromise");
const focusDescription = document.querySelector("#focusDescription");
const focusFacts = document.querySelector("#focusFacts");

function renderProduct(key) {
  const product = products[key];
  if (!product || productPanel.dataset.currentProduct === key) return;

  productPanel.classList.add("is-switching");
  window.setTimeout(() => {
    productPanel.dataset.currentProduct = key;
    focusImage.src = product.image;
    focusImage.alt = product.alt;
    focusStage.textContent = product.stage;
    focusTiming.textContent = product.timing;
    focusName.textContent = product.name;
    focusPromise.textContent = product.promise;
    focusDescription.textContent = product.description;
    focusFacts.innerHTML = product.facts
      .map(([term, value]) => `<div><dt>${term}</dt><dd>${value}</dd></div>`)
      .join("");
    productPanel.classList.remove("is-switching");
  }, prefersReducedMotion.matches ? 0 : 190);
}

stageTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => {
    stageTabs.forEach((item) => {
      const isActive = item === tab;
      item.classList.toggle("active", isActive);
      item.setAttribute("aria-selected", String(isActive));
    });
    renderProduct(tab.dataset.product);
  });

  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const target = stageTabs[(index + offset + stageTabs.length) % stageTabs.length];
    target.focus();
    target.click();
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -7% 0px" },
);

document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const mobileMenuButton = document.querySelector(".menu-trigger");
const mobileNav = document.querySelector("#mobileNav");

function setMobileMenu(open) {
  mobileMenuButton.setAttribute("aria-expanded", String(open));
  mobileMenuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  mobileNav.hidden = !open;
}

mobileMenuButton.addEventListener("click", () => {
  setMobileMenu(mobileMenuButton.getAttribute("aria-expanded") !== "true");
});

mobileNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMobileMenu(false)));

const galleryImages = [...document.querySelectorAll(".gallery-image")];
const galleryCurrent = document.querySelector("#galleryCurrent");
let galleryIndex = 0;

function showGallery(nextIndex) {
  galleryIndex = (nextIndex + galleryImages.length) % galleryImages.length;
  galleryImages.forEach((image, index) => image.classList.toggle("active", index === galleryIndex));
  galleryCurrent.textContent = String(galleryIndex + 1).padStart(2, "0");
}

document.querySelector("[data-gallery-prev]").addEventListener("click", () => showGallery(galleryIndex - 1));
document.querySelector("[data-gallery-next]").addEventListener("click", () => showGallery(galleryIndex + 1));

const purchaseRadios = [...document.querySelectorAll('input[name="purchase"]')];
const modeOptions = [...document.querySelectorAll(".mode-option")];
const frequencyControl = document.querySelector("#frequencyControl");
const frequencyButtons = [...document.querySelectorAll("[data-frequency]")];
const deliveryInterval = document.querySelector("#deliveryInterval");
const quantityValue = document.querySelector("#quantityValue");
const cartPrice = document.querySelector("#cartPrice");
let purchaseMode = "subscription";
let unitPrice = 69;
let quantity = 1;
let frequency = 2;

const frequencyData = {
  2: "Refills every 5 weeks",
  3: "Refills every 4 weeks",
  5: "Refills every 2 weeks",
};

function updatePurchasePrice() {
  const total = unitPrice * quantity;
  cartPrice.textContent = `EUR ${total}`;
}

purchaseRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    purchaseMode = radio.value;
    unitPrice = purchaseMode === "subscription" ? 69 : 79;
    modeOptions.forEach((option) => option.classList.toggle("active", option.contains(radio)));
    frequencyControl.hidden = purchaseMode !== "subscription";
    updatePurchasePrice();
  });
});

frequencyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    frequency = Number(button.dataset.frequency);
    frequencyButtons.forEach((item) => item.classList.toggle("active", item === button));
    deliveryInterval.textContent = frequencyData[frequency];
  });
});

document.querySelector("[data-quantity-minus]").addEventListener("click", () => {
  quantity = Math.max(1, quantity - 1);
  quantityValue.value = String(quantity);
  quantityValue.textContent = String(quantity);
  updatePurchasePrice();
});

document.querySelector("[data-quantity-plus]").addEventListener("click", () => {
  quantity = Math.min(8, quantity + 1);
  quantityValue.value = String(quantity);
  quantityValue.textContent = String(quantity);
  updatePurchasePrice();
});

const cartDrawer = document.querySelector("#cartDrawer");
const cartTrigger = document.querySelector(".cart-trigger");
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
  cartTrigger.setAttribute("aria-expanded", "true");
  drawerBackdrop.hidden = false;
  document.body.classList.add("no-scroll");
  cartDrawer.querySelector(".drawer-head button").focus();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  cartTrigger.setAttribute("aria-expanded", "false");
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
      (item, index) => `
        <article class="drawer-item">
          <div class="drawer-item-image"><img src="assets/bend-rally-front.png" alt=""></div>
          <div>
            <strong>${item.name}</strong>
            <small>${item.mode} / Qty ${item.quantity}</small>
          </div>
          <button type="button" data-remove-item="${index}">Remove</button>
        </article>
      `,
    )
    .join("");

  drawerItems.querySelectorAll("[data-remove-item]").forEach((button) => {
    button.addEventListener("click", () => {
      cart.splice(Number(button.dataset.removeItem), 1);
      renderCart();
    });
  });
}

cartTrigger.addEventListener("click", openCart);
document.querySelectorAll("[data-cart-close]").forEach((button) => button.addEventListener("click", closeCart));

document.querySelector("[data-add]").addEventListener("click", () => {
  cart.push({
    name: "BEND Match Stack",
    mode: purchaseMode === "subscription" ? `${frequency}x weekly plan` : "One-time",
    quantity,
    price: unitPrice,
  });
  renderCart();
  showToast("Match Stack added to bag");
  openCart();
});

document.querySelector("#checkoutButton").addEventListener("click", () => {
  showToast("Checkout is not connected in this brand prototype");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) closeCart();
});

document.querySelectorAll("[data-account-action]").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelector("#accountStatus").textContent = `${button.dataset.accountAction}. Prototype only — nothing was changed.`;
  });
});

document.querySelector("#signupForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const email = new FormData(event.currentTarget).get("email");
  document.querySelector("#signupStatus").textContent = `Access request recorded for ${email}. Prototype only — no data was sent.`;
  event.currentTarget.reset();
});

document.querySelectorAll(".dialog-open").forEach((button) => {
  button.addEventListener("click", () => document.querySelector(`#${button.dataset.dialog}`).showModal());
});

document.querySelectorAll(".formula-dialog").forEach((dialog) => {
  dialog.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

document.querySelectorAll(".faq-list details").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    document.querySelectorAll(".faq-list details").forEach((other) => {
      if (other !== details) other.open = false;
    });
  });
});

function setupHeroCanvas() {
  const canvas = document.querySelector("#courtCanvas");
  const context = canvas.getContext("2d");
  const hero = canvas.closest(".hero");
  let width = 0;
  let height = 0;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function draw(time = 0) {
    context.clearRect(0, 0, width, height);
    pointerX += (targetX - pointerX) * 0.05;
    pointerY += (targetY - pointerY) * 0.05;

    const progress = (time * 0.00012) % 1;
    const x0 = width * 0.06;
    const y0 = height * 0.78;
    const x1 = width * 0.43;
    const y1 = height * 0.18;
    const x2 = width * 0.7;
    const y2 = height * 0.34;

    context.save();
    context.translate(pointerX * 10, pointerY * 8);
    context.beginPath();
    context.moveTo(x0, y0);
    context.quadraticCurveTo(x1, y1, x2, y2);
    context.strokeStyle = "rgba(200,255,34,0.78)";
    context.lineWidth = 1.2;
    context.stroke();

    const inv = 1 - progress;
    const ballX = inv * inv * x0 + 2 * inv * progress * x1 + progress * progress * x2;
    const ballY = inv * inv * y0 + 2 * inv * progress * y1 + progress * progress * y2;
    const glow = context.createRadialGradient(ballX, ballY, 1, ballX, ballY, 22);
    glow.addColorStop(0, "rgba(226,255,92,1)");
    glow.addColorStop(0.28, "rgba(200,255,34,0.92)");
    glow.addColorStop(1, "rgba(200,255,34,0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(ballX, ballY, 22, 0, Math.PI * 2);
    context.fill();

    for (let index = 0; index < 16; index += 1) {
      const phase = ((progress - index * 0.016) + 1) % 1;
      const phaseInv = 1 - phase;
      const px = phaseInv * phaseInv * x0 + 2 * phaseInv * phase * x1 + phase * phase * x2;
      const py = phaseInv * phaseInv * y0 + 2 * phaseInv * phase * y1 + phase * phase * y2;
      context.fillStyle = `rgba(200,255,34,${0.18 * (1 - index / 16)})`;
      context.beginPath();
      context.arc(px, py, Math.max(1, 4 - index * 0.16), 0, Math.PI * 2);
      context.fill();
    }
    context.restore();

    if (!prefersReducedMotion.matches) frame = window.requestAnimationFrame(draw);
  }

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    targetX = event.clientX / rect.width - 0.5;
    targetY = event.clientY / rect.height - 0.5;
  });
  hero.addEventListener("pointerleave", () => {
    targetX = 0;
    targetY = 0;
  });

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  draw();

  prefersReducedMotion.addEventListener("change", () => {
    window.cancelAnimationFrame(frame);
    draw();
  });
}

function setupProtocolCanvas() {
  const canvas = document.querySelector("#protocolCanvas");
  const context = canvas.getContext("2d");
  let width = 0;
  let height = 0;
  let frame = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    draw();
  }

  function curvePoint(t) {
    const points = [
      [width * 0.04, height * 0.66],
      [width * 0.23, height * 0.52],
      [width * 0.36, height * 0.17],
      [width * 0.54, height * 0.23],
      [width * 0.69, height * 0.36],
      [width * 0.83, height * 0.3],
      [width * 0.96, height * 0.7],
    ];
    const scaled = t * (points.length - 1);
    const index = Math.min(Math.floor(scaled), points.length - 2);
    const local = scaled - index;
    const p0 = points[Math.max(0, index - 1)];
    const p1 = points[index];
    const p2 = points[Math.min(points.length - 1, index + 1)];
    const p3 = points[Math.min(points.length - 1, index + 2)];
    const t2 = local * local;
    const t3 = t2 * local;
    const interpolate = (axis) =>
      0.5 *
      ((2 * p1[axis]) +
        (-p0[axis] + p2[axis]) * local +
        (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t2 +
        (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t3);
    return [interpolate(0), interpolate(1)];
  }

  function draw(time = 0) {
    context.clearRect(0, 0, width, height);
    context.save();
    context.beginPath();
    for (let step = 0; step <= 120; step += 1) {
      const [x, y] = curvePoint(step / 120);
      if (step === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.strokeStyle = "#c8ff22";
    context.lineWidth = 2;
    context.stroke();

    context.setLineDash([5, 8]);
    context.beginPath();
    context.moveTo(width * 0.04, height * 0.72);
    context.bezierCurveTo(width * 0.32, height * 0.39, width * 0.68, height * 0.67, width * 0.96, height * 0.58);
    context.strokeStyle = "rgba(255,255,255,0.38)";
    context.lineWidth = 1;
    context.stroke();
    context.setLineDash([]);

    [0.07, 0.5, 0.94].forEach((t, index) => {
      const [x, y] = curvePoint(t);
      context.fillStyle = index === 0 ? "#bba7ff" : index === 1 ? "#c8ff22" : "#f6a178";
      context.beginPath();
      context.arc(x, y, 7, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "rgba(255,255,255,0.82)";
      context.lineWidth = 1;
      context.beginPath();
      context.arc(x, y, 18, 0, Math.PI * 2);
      context.stroke();
    });

    const t = (time * 0.00008) % 1;
    const [ballX, ballY] = curvePoint(t);
    const glow = context.createRadialGradient(ballX, ballY, 0, ballX, ballY, 26);
    glow.addColorStop(0, "rgba(255,255,255,1)");
    glow.addColorStop(0.2, "rgba(200,255,34,1)");
    glow.addColorStop(1, "rgba(200,255,34,0)");
    context.fillStyle = glow;
    context.beginPath();
    context.arc(ballX, ballY, 26, 0, Math.PI * 2);
    context.fill();
    context.restore();

    if (!prefersReducedMotion.matches) frame = window.requestAnimationFrame(draw);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  draw();

  prefersReducedMotion.addEventListener("change", () => {
    window.cancelAnimationFrame(frame);
    draw();
  });
}

setupHeroCanvas();
setupProtocolCanvas();
