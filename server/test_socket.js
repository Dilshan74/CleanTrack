const { io } = require("socket.io-client");

console.log("Starting socket test...");

const residentSocket = io("http://localhost:5000");
const driverSocket = io("http://localhost:5000");

residentSocket.on("connect", () => {
  console.log("Resident connected");
  residentSocket.emit("join", "route:80260");
});

residentSocket.on("driver_location_update", (data) => {
  console.log("Resident received location update:", data);
  process.exit(0);
});

driverSocket.on("connect", () => {
  console.log("Driver connected");
  
  // Simulate emitLocation
  setTimeout(() => {
    console.log("Driver emitting location...");
    driverSocket.emit("driver_location", {
      driverId: "6a776ee2050f7347cebad280",
      driverName: "Yashod Rawana",
      postalCode: "80260",
      lat: 6.07860,
      lng: 80.19557,
      speed: 0,
      heading: 0
    });
  }, 1000);
});

setTimeout(() => {
  console.error("Test timed out! Resident did not receive the update.");
  process.exit(1);
}, 3000);
