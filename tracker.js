let batteryChart; 
let usageChart;

document.addEventListener("DOMContentLoaded", async () => {
    const startBtn = document.getElementById("startBtn");
    const output = document.getElementById("output");
    const energyInfo = document.getElementById("energyInfo");
    const remainingYearsEl = document.getElementById("remainingYearsMsg");

    const barchart = document.getElementById("usageChart");
    const batterychart = document.getElementById("batteryChart");

    const battery = await navigator.getBattery();

    const centerTextPlugin = {
        id: 'centerText',
        beforeDraw(chart) {
            const { ctx, width, height } = chart;
            ctx.save();
            const fontSize = (height / 4).toFixed(0);
            ctx.font = `${fontSize}px Arial`;
            ctx.fillStyle = "#000000";
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const percent = Math.round(chart.data.datasets[0].data[1]);
            ctx.fillText(`${percent}%`, width / 2, height / 2);
            ctx.restore();
        }
    };

    async function loadUsageChart(userRef) {
        console.log("loading usage chart...");
        const snapshot = await userRef.collection("dailyUsage")
            .orderBy("date", "desc")
            .limit(7)
            .get();

        const labels = [];
        const values = [];

        snapshot.forEach(doc => {
            const data = doc.data();
            labels.push(data.date);
            const energy = Number(data.totalEnergyUsedWh || 0);
            values.push(parseFloat(energy.toFixed(2)));
        });


        labels.reverse();
        values.reverse();

        const ctxBar = document.getElementById("usageChart").getContext("2d");
        if (!usageChart) {
            usageChart = new Chart(ctxBar, {
                type: "bar",
                data: {
                    labels,
                    datasets: [{
                        label: "Energy Used (Wh)",
                        data: values,
                        backgroundColor: "#2ecc71",
                        borderRadius: 6,
                        borderWidth: 0,
                        maxBarThickness: 40
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true,
                            text: "Daily Battery Usage (Last 7 Days)",
                            font: { size: 14 }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: "Wh"
                            }
                        },
                        x: {
                            title: {
                                display: true,
                                text: "Date"
                            }
                        }
                    }
                }
            });
        } else {
            usageChart.data.labels = labels;
            usageChart.data.datasets[0].data = values;
            usageChart.update();
        }
    }
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
            const lastLevel = data.lastBatteryLevel ?? currentLevel;
            const delta = lastLevel - currentLevel;
            const type = data.deviceType;
            const age = data.deviceAge;
            let newTotal = data.totalEnergyUsedWh;
            const ageNumber = Number(data.deviceAge);
            const remainingYears = getRemainingYears(ageNumber);

            if (remainingYearsEl) {
                remainingYearsEl.textContent =
                    `Estimated remaining lifespan: ${remainingYears} years`;
            }
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

                const today = new Date().toISOString().split("T")[0]; 
                const dailyRef = userRef.collection("dailyUsage").doc(today);
                await dailyRef.set({
                    totalEnergyUsedWh: firebase.firestore.FieldValue.increment(energyUsed),
                    date: today
                }, { merge: true });
            }
            await userRef.update({
                lastBatteryLevel: currentLevel,
                totalEnergyUsedWh: newTotal,
                lastUpdated: Date.now()
            });

            energyInfo.textContent = `Total energy used: ${newTotal.toFixed(2)} Wh`;
            await loadUsageChart(userRef);
        } catch (err) {
            console.error(err);
            alert("Battery tracking failed: " + err.message);
        }
    }

    startBtn.addEventListener("click", () => {
        trackBattery();
        battery.addEventListener("levelchange", trackBattery);
        barchart.style.display = "block";
        batterychart.style.display = "block";
    });
});