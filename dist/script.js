const frequencyData = {
  2: {
    rhythm: "Two matches a week",
    interval: "Every 5 weeks",
    refillPrice: "EUR 39.60",
    matchCost: "EUR 3.96",
  },
  3: {
    rhythm: "Three matches a week",
    interval: "Every 4 weeks",
    refillPrice: "EUR 39.60",
    matchCost: "EUR 3.96",
  },
  5: {
    rhythm: "Five matches a week",
    interval: "Every 2 weeks",
    refillPrice: "EUR 39.60",
    matchCost: "EUR 3.96",
  },
};

const rhythmLabel = document.querySelector("#rhythmLabel");
const intervalLabel = document.querySelector("#intervalLabel");
const refillPrice = document.querySelector("#refillPrice");
const matchCost = document.querySelector("#matchCost");
const frequencyButtons = document.querySelectorAll(".freq-button");

frequencyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const frequency = button.dataset.frequency;
    const data = frequencyData[frequency];

    frequencyButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    rhythmLabel.textContent = data.rhythm;
    intervalLabel.textContent = data.interval;
    refillPrice.textContent = data.refillPrice;
    matchCost.textContent = data.matchCost;
  });
});

const portalStatus = document.querySelector("#portalStatus");
document.querySelectorAll("[data-portal-action]").forEach((button) => {
  button.addEventListener("click", () => {
    portalStatus.textContent = `${button.dataset.portalAction}. You stay in control.`;
  });
});

const signupForm = document.querySelector("#signupForm");
const signupStatus = document.querySelector("#signupStatus");

signupForm.addEventListener("submit", (event) => {
  event.preventDefault();
  signupStatus.textContent = "Reserved. Your launch kit access is attached to this email.";
  signupForm.reset();
});
