const path = require("path");
const os = require("os");

const { downloadAndUnzipVSCode } = require("@vscode/test-electron");
const { _electron } = require("@playwright/test");

const extensionDevelopmentPath = path.resolve(__dirname, "../");

const args = [
  "--disable-gpu-sandbox", // https://github.com/microsoft/vscode-test/issues/221
  "--disable-updates", // https://github.com/microsoft/vscode-test/issues/120
  "--disable-workspace-trust",
  "--extensionDevelopmentPath=" + extensionDevelopmentPath,
  "--new-window", // Opens a new session of VS Code instead of restoring the previous session (default).
  "--no-sandbox", // https://github.com/microsoft/vscode/issues/84238
  "--profile-temp", // "debug in a clean environment"
  "--skip-release-notes",
  "--skip-welcome",
  "--user-data-dir",
  os.tmpdir(),
];

var assert = require("assert");
describe("Array", function () {
  describe("#indexOf()", function () {
    it("should return -1 when the value is not present", function () {
      assert.equal([1, 2, 3].indexOf(4), -1);
    });
  });
});

describe("vscode Extension", function () {
  this.timeout(0);
  let electronApp;
  beforeEach(async () => {
    const vscodeExecutablePath = await downloadAndUnzipVSCode();
    electronApp = await _electron.launch({
      executablePath: vscodeExecutablePath,
      args,
    });
  });

  describe("keyboard", () => {
    it("run helloworld by using command pallet", async () => {
      const window = await electronApp.firstWindow();
/*       console.log("data!!");
      await window.waitForTimeout(1000);
      await window.keyboard.press("Shift+Meta+F");
      console.log("search..");

      await window.waitForTimeout(5000);
      await window.keyboard.press("Shift+Meta+E");
      console.log("explorer..");

      await window.waitForTimeout(5000);
      await window.keyboard.press("Shift+Meta+P");
      console.log("pallet..");
 */
      await window.waitForTimeout(5000);
      await window.keyboard.press("Shift+Meta+P");
      await window.waitForTimeout(5000);
      await window.keyboard.type("helloWorld", { delay: 100 });
      console.log("type helloWorld..");
      await window.waitForTimeout(1000);
      await window.keyboard.press("Enter");
      await window.waitForTimeout(5000);
      electronApp.close();
      await window.waitForTimeout(3000);
    });

    it("run hello input by using command pallet", async () => {
      const window = await electronApp.firstWindow();
      await window.waitForTimeout(5000);
      await window.keyboard.press("Shift+Meta+P");
      await window.waitForTimeout(5000);
      await window.keyboard.type("spike hello input", { delay: 100 });
      console.log("type hello input..");
      await window.waitForTimeout(1000);
      await window.keyboard.press("Enter");

      await window.waitForTimeout(1000);
      await window.keyboard.type("テストです。", { delay: 100 });
      console.log("type テストです。");
      await window.waitForTimeout(1000);
      await window.keyboard.press("Enter");
      await window.waitForTimeout(5000);
      electronApp.close();
      await window.waitForTimeout(3000);
    });
  });
});
