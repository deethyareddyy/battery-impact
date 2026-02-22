document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const appContainer = document.getElementById("appContainer");
  const authContainer = document.getElementById("authContainer");
  const deviceTypeEl = document.getElementById("deviceType");
  const deviceAgeEl = document.getElementById("deviceAgeYears");
  const stateEl = document.getElementById("stateSelect");
  const deviceMsgEl = document.getElementById("deviceMsg");
  const remainingYearsEl = document.getElementById("remainingYearsMsg");
  
  const signupContainer = document.getElementById("signupContainer");
  const deviceTypes = document.getElementById("deviceType");
  const ageInput = document.getElementById("deviceAgeYears");

  const contSelect = document.getElementById("contSelect");
const continentFactsEl = document.getElementById("continentFacts");

const continentFacts = {
  NA: "Annual electricity consumption: ~5,381 TWh<br>Cost per year: $699,530,000,000 (~$700 billion)",
  SA: "Annual electricity consumption: ~1,285 TWh<br>Cost per year: $154,200,000,000 (~$154 billion)",
  AS: "Annual electricity consumption: ~17,093 TWh<br>Cost per year: $2,222,090,000,000 (~$2.2 trillion)",
  ER: "Annual electricity consumption: ~4,510 TWh<br>Cost per year: $1,037,300,000,000 (~$1.04 trillion)",
  AF: "Annual electricity consumption: ~937 TWh<br>Cost per year: $112,440,000,000 (~$112 billion)",
  OC: "Annual electricity consumption: ~329 TWh<br>Cost per year: $65,800,000,000 (~$66 billion)"
};

contSelect.addEventListener("change", () => {
  const value = contSelect.value;

  if (!value) {
    continentFactsEl.innerHTML = "";
    return;
  }

  continentFactsEl.innerHTML = continentFacts[value];
});

  // Signup
  signupBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const deviceType = deviceTypes.value;
    const ageValue = ageInput.value;
    const ageNumber = Number(ageValue);
    const remainingYears = getRemainingYears(ageNumber);
    auth.createUserWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Signed up:", user.uid);

        db.collection("users").doc(user.uid).set({
          totalEnergyUsedWh: 0,
          deviceType: deviceType,
          deviceAge: ageValue,
          lastUpdated: Date.now(),
          state: null,
          email: email
        });
        if (remainingYearsEl) {
          remainingYearsEl.textContent = `Estimated remaining lifespan: ${remainingYears} years`;
        }

        showApp();
      })
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  });

 

  loginBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    auth.signInWithEmailAndPassword(email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Logged in:", user.uid);
        showApp();
      })
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  });

  async function showApp() {
    authContainer.style.display = "none";
    appContainer.style.display = "block";
    console.log("app is running");
  }

});