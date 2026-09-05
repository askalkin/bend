const cartCount = document.querySelector("#cartCount");
const cartToast = document.querySelector("#cartToast");
const addButtons = document.querySelectorAll("[data-add]");
const variantLinks = document.querySelectorAll(".site-nav nav a");
const routes = document.querySelectorAll(".webpage");

let cartItems = 0;
let toastTimer = null;

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cartItems += 1;
    cartCount.textContent = String(cartItems);
    cartToast.textContent = `${button.dataset.add} added to kit`;
    cartToast.classList.add("visible");

    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      cartToast.classList.remove("visible");
    }, 1900);
  });
});

const routeObserver = new IntersectionObserver(
  (entries) => {
    const visibleRoute = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visibleRoute) return;

    variantLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${visibleRoute.target.id}`);
    });
  },
  {
    rootMargin: "-36% 0px -56% 0px",
    threshold: [0.12, 0.24, 0.48],
  },
);

routes.forEach((route) => routeObserver.observe(route));
