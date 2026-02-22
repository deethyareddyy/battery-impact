function getWattageRate(device_type, age) {
    console.log("Device info:" + device_type);
    let wattage;
    battery_capacity = 100 - 0.05 * age;
  switch (device_type) {
    case "Smaller MacBook Air":
        wattage = 49.9;
        break;
    case "Modern MacBook Air":
        wattage= 53.8;
        break;
    case "14 inch MacBook Pro":
        wattage = 70;
      break;
    case "16 inch MacBook Pro":
        wattage = 100;
      break;
    default:
      return "No matching model found";
  }
  return wattage;
}

function getWattage(diff, wattage_rate) {
    return diff * wattage_rate;
};

function getRemainingYears(age) {
    return 5 - age;
}