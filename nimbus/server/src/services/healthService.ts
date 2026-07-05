// Health service module for the Nimbus API server
export function getHealthStatus() {
  return {
    status: "ok",
    service: "nimbus-api",
    uptime: process.uptime(),
  };
}
