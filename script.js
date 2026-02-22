document.addEventListener("DOMContentLoaded", () => {
  const signupBtn = document.getElementById("signupBtn");
  const loginBtn = document.getElementById("loginBtn");
  const appContainer = document.getElementById("appContainer");
  const authContainer = document.getElementById("authContainer");
  const deviceTypeEl = document.getElementById("deviceType");
  const deviceAgeEl = document.getElementById("deviceAgeYears");
  const stateEl = document.getElementById("stateSelect");
  const deviceMsgEl = document.getElementById("deviceMsg");
  
  const signupContainer = document.getElementById("signupContainer");
  const deviceTypes = document.getElementById("deviceType");
  const ageInput = document.getElementById("deviceAgeYears");

  // Signup
  signupBtn.addEventListener("click", () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    const deviceType = deviceTypes.value;
    const ageValue = ageInput.value;
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

        showApp();
      })
      .catch((error) => {
        console.error(error);
        alert(error.message);
      });
  });

    function showDeviceMsg(text, isError = true) {
    if (!deviceMsgEl) return;
    deviceMsgEl.textContent = text;
    deviceMsgEl.style.color = isError ? "crimson" : "inherit";
  }

  function validateInputs() {
    const deviceType = deviceTypeEl?.value?.trim();
    const ageStr = deviceAgeEl?.value?.trim();
    const state = stateEl?.value?.trim();

    if (!deviceType) {
      showDeviceMsg("Please select your device model.");
      return false;
    }

    if (!ageStr) {
      showDeviceMsg("Please enter how long you have used this laptop.");
      return false;
    }

    const age = Number(ageStr);
    if (Number.isNaN(age) || age < 0) {
      showDeviceMsg("Years must be a valid number greater than or equal to 0.");
      return false;
    }

    if (!state) {
      showDeviceMsg("Please select your state.");
      return false;
    }

    showDeviceMsg(""); // clear message
    return true;
  }

  // Login
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

  function showApp() {
    authContainer.style.display = "none";
    appContainer.style.display = "block";
    console.log("app is running")
  }
});