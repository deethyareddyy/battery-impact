const startBtn = document.getElementById("startBtn");
const output = document.getElementById("output");
const batteryInfo = document.getElementById("batteryInfo");
const energyInfo = document.getElementById("energyInfo");

let startLevel = null;

// Average phone battery capacity (Wh)
const BATTERY_CAPACITY_WH = 12;
const LITHIUM_PER_WH = 0.3; // grams (rough estimate)

startBtn.addEventListener("click", async () => {
  if (!("getBattery" in navigator)) {
    alert("Battery information is not supported on this browser.");
    return;
  }

  const battery = await navigator.getBattery();

  startLevel = battery.level;
  output.style.display = "block";

  batteryInfo.textContent = `Starting battery level: ${(startLevel * 100).toFixed(0)}%`;

  // Check again after 5 minutes
  setTimeout(async () => {
    const newBattery = await navigator.getBattery();
    const endLevel = newBattery.level;

    const percentUsed = (startLevel - endLevel) * 100;
    const energyUsed = (percentUsed / 100) * BATTERY_CAPACITY_WH;
    const lithiumUsed = energyUsed * LITHIUM_PER_WH;

    energyInfo.textContent = `
      Estimated energy used: ${energyUsed.toFixed(2)} Wh
      (≈ ${lithiumUsed.toFixed(2)} g lithium)
    `;
  }, 5 * 60 * 1000);
});