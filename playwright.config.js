module.exports = {
  testDir: "./tests",
  timeout: 30000,
  use: {
    channel: "msedge",
    headless: true,
    viewport: { width: 1280, height: 800 }
  }
};
