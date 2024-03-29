const execa = require("execa");

async function main() {
  try {
    await execa("yarpm", "run pm2 stop all".split(" "), {
      stdio: [0, 1, 2],
      env: { PM2_HOME: "./.pm2" }
    });
    await execa("yarpm", "run pm2 kill".split(" "), {
      stdio: [0, 1, 2],
      env: { PM2_HOME: "./.pm2" }
    });
  } catch (e) {
    console.log(e);
  }
}
main();
