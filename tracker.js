const UPDATE_INTERVAL = 30 * 1000;
let batteryChart; // Chart.js instance

document.addEventListener("DOMContentLoaded", async () => {
    const startBtn = document.getElementById("startBtn");
    const output = document.getElementById("output");
    const energyInfo = document.getElementById("energyInfo");

    // Get battery object once
    const battery = await navigator.getBattery();

    // Center text plugin
    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw(chart) {
            const { ctx, width, height } = chart;
            ctx.save();
            const fontSize = (height / 4).toFixed(0);
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = "#2ecc71"; // green for remaining battery
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const percent = Math.round(chart.data.datasets[0].data[1]);
            ctx.fillText(`${percent}%`, width / 2, height / 2);
            ctx.restore();
        }
    };

    async function trackBattery() {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const userRef = db.collection("users").doc(user.uid);
            const snap = await userRef.get();
            const currentLevel = battery.level;
            const percent = Math.round(currentLevel * 100);

            output.style.display = "block";

            const chartData = {
                labels: ["Used", "Remaining"],
                datasets: [{
                    data: [100 - percent, percent],
                    backgroundColor: ["white", "#2ecc71"],
                    borderWidth: 0
                }]
            };

            // Initialize chart if not exists
            if (!batteryChart) {
                const ctx = document.getElementById("batteryChart").getContext("2d");
                batteryChart = new Chart(ctx, {
                    type: "doughnut",
                    data: chartData,
                    options: {
                        cutout: "70%",
                        plugins: { legend: { display: false } }
                    },
                    plugins: [centerTextPlugin]
                });
            } else {
                batteryChart.data.datasets[0].data = [100 - percent, percent];
                batteryChart.update();
            }

            // Firestore logic
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
            const lastLevel = data.lastBatteryLevel ?? currentLevel; // first run uses currentLevel
            const delta = lastLevel - currentLevel;
            const type = data.deviceType;
            const age = data.deviceAge;
            let newTotal = data.totalEnergyUsedWh;

            const battery_wattage = getWattageRate(type, age);
            console.log("currentLevel:", currentLevel);
            console.log("lastBatteryLevel:", data.lastBatteryLevel);
            console.log("delta:", delta);
            console.log("battery_wattage:", battery_wattage);
            console.log("type:", type);
            console.log("age:", age);
            if (delta > 0) {
                const energyUsed = getWattage(delta, battery_wattage);
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

        // Listen to battery level changes
        battery.addEventListener("levelchange", trackBattery);
    });
});