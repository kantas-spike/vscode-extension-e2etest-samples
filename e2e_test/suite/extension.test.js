const path = require("path");
const os = require("os");

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

var assert = require("assert");

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
// const vscode = require('vscode');
// const myExtension = require('../extension');
let electronApp;
suite('Extension Test Suite', function() {

  suiteSetup('suite setup', () => {
    console.log('suite setup')
  })

  suiteTeardown('suite teardown', () => {
    console.log('suite teadown')
  })

  setup('setup', async () => {
    console.log("setup")
    const vscodeExecutablePath = await downloadAndUnzipVSCode();
    electronApp = await _electron.launch({
      executablePath: vscodeExecutablePath,
      args,
    });
  })

  teardown('teardown', () => {
    console.log("teardown")
    electronApp.close();
  })

	// vscode.window.showInformationMessage('Start all tests.');

	test('コマンドパレットからhelloworld実行', async () => {
    const window = await electronApp.firstWindow();
    await window.waitForTimeout(5000);
    await window.keyboard.press("Shift+Meta+P");
    await window.waitForTimeout(5000);
    await window.keyboard.type("helloWorld", { delay: 100 });
    console.log("type helloWorld..");
    await window.waitForTimeout(1000);
    await window.keyboard.press("Enter");
    await window.waitForTimeout(5000);
    // const notifications = await window.locator("")
    //const list = await window.getByText('Hello World from').all()
    const notification = await window.locator(".notification-toast-container .monaco-list-row").first()
    assert.ok(notification)
    assert.strictEqual("Hello World from spike-playwright!", await notification.innerText())

    await window.waitForTimeout(5000);
	});

  test('コマンドパレットからHelloInput実行', async () => {
    const window = await electronApp.firstWindow();

    await window.waitForTimeout(1000);
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
    const notification = await window.locator(".notification-toast-container .monaco-list-row").first()
    assert.ok(notification)
    assert.strictEqual("quick input: 入力テストです。", await notification.innerText())
	});


});
