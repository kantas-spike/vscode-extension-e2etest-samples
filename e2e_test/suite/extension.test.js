const path = require("path");
const os = require("os");
var assert = require("assert");

const { downloadAndUnzipVSCode } = require("@vscode/test-electron");
const { _electron } = require("playwright");

const extensionDevelopmentPath = path.resolve(__dirname, "../..");

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

suite("Extension Test Suite", function () {
  let electronApp;
  setup("vscodeをplaywriteで起動", async function () {
    console.log(this.test.title);
    const vscodeExecutablePath = await downloadAndUnzipVSCode();
    electronApp = await _electron.launch({
      executablePath: vscodeExecutablePath,
      args,
    });
  });

  teardown("起動したvscodeを終了", function () {
    console.log(this.test.title);
    electronApp.close();
  });

  test("コマンドパレットからhelloworld実行", async () => {
    // arrange?
    const window = await electronApp.firstWindow();
    await window.waitForTimeout(5000);

    // act?
    await window.keyboard.press("Shift+Meta+P");
    await window.waitForTimeout(5000);
    await window.keyboard.type("helloWorld", { delay: 100 });
    console.log("type helloWorld..");
    await window.waitForTimeout(1000);
    await window.keyboard.press("Enter");
    await window.waitForTimeout(5000);

    // assert?
    const notification = await window
      .locator(".notification-toast-container .monaco-list-row")
      .first();
    assert.ok(notification);
    assert.strictEqual(
      "Hello World from spike-playwright!",
      await notification.innerText()
    );
  });

  test("コマンドパレットからHelloInput実行", async () => {
    // arrange?
    const window = await electronApp.firstWindow();
    await window.waitForTimeout(1000);

    // act?
    await window.keyboard.press("Shift+Meta+P");
    await window.waitForTimeout(3000);
    await window.keyboard.type("spike hello input", { delay: 100 });
    console.log("type hello input..");
    await window.waitForTimeout(1000);
    await window.keyboard.press("Enter");

    await window.waitForTimeout(1000);
    await window.keyboard.type("入力テストです。", { delay: 100 });
    await window.waitForTimeout(1000);
    await window.keyboard.press("Enter");
    await window.waitForTimeout(5000);

    // assert?
    const notification = await window
      .locator(".notification-toast-container .monaco-list-row")
      .first();
    assert.ok(notification);
    assert.strictEqual(
      "quick input: 入力テストです。",
      await notification.innerText()
    );
  });
});
