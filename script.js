document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startBtn");
  const output = document.getElementById("output");
  const batteryInfo = document.getElementById("batteryInfo");
  const energyInfo = document.getElementById("energyInfo");
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const appContainer = document.getElementById("appContainer");
  const authContainer = document.getElementById("authContainer");

  signupBtn.addEventListener("click", () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Signed up:", user.uid);

      // Create Firestore document
      db.collection("users").doc(user.uid).set({
        lastBatteryLevel: null,
        totalEnergyUsedWh: 0,
        lastUpdated: Date.now(),
        state: null,   // optional
        email: email   // optional
      });

      showApp(); // show battery tracker UI
    })
    .catch((error) => {
      console.error(error);
      alert(error.message);  // ← shows a popup if signup fails
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
      alert(error.message);  // ← shows a popup if login fails
    });
});

  function showApp() {
    authContainer.style.display = "none";
    appContainer.style.display = "block";
  }

  const BATTERY_CAPACITY_WH = 50;
  const UPDATE_INTERVAL = 5 * 60 * 1000;

  async function trackBattery() {
  try {
    const battery = await navigator.getBattery();
    const user = auth.currentUser;
    if (!user) return;

    const userRef = db.collection("users").doc(user.uid);
    const snap = await userRef.get();
    const currentLevel = battery.level;

    // Show battery in UI
    output.style.display = "block";
    batteryInfo.textContent = `Battery level: ${(currentLevel*100).toFixed(0)}%`;

    if (!snap.exists) {
      await userRef.set({
        lastBatteryLevel: currentLevel,
        totalEnergyUsedWh: 0,
        lastUpdated: Date.now(),
        state: document.getElementById("stateSelect").value || null
      });
      energyInfo.textContent = `Total energy used: 0 Wh`;
      return;
    }

    const data = snap.data();
    const delta = (data.lastBatteryLevel ?? currentLevel) - currentLevel;

    let newTotal = data.totalEnergyUsedWh;

    if (delta > 0) {
      const energyUsed = delta * BATTERY_CAPACITY_WH;
      newTotal += energyUsed;

      await userRef.update({
        lastBatteryLevel: currentLevel,
        totalEnergyUsedWh: newTotal,
        lastUpdated: Date.now()
      });
    }

    energyInfo.textContent = `Total energy used: ${newTotal.toFixed(2)} Wh`;
  } catch (err) {
    console.error(err);
    alert("Battery tracking failed: " + err.message);
  }
}

  startBtn.addEventListener("click", () => {
    trackBattery();
    setInterval(trackBattery, UPDATE_INTERVAL);
  });

});