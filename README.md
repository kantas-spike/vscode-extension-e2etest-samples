# vscode-extension-e2etest-samples

vscode 拡張機能の E2E テストのサンプルです。

vscode 拡張機能のテストで、コマンドパレットや`Quick Pick`利用時に自動でユーザー入力したいです。

このように、関数を直接テストするのではなく、テスト対象のサイトやアプリケーションを、
実際利用する時のようにブラウザやアプリケーション自身を使ってテストすることを、E2E テストと呼ぶようです。

vscode 拡張機能の E2E テスト方法を調査してみます。

少し調べてみると、[[Feature] VS Code as a Playwright target · Issue #22351 · microsoft/playwright](https://github.com/microsoft/playwright/issues/22351#issuecomment-1622366186)が使えそうかも?

ということで、少し試してみます。

## 環境構築

### プロジェクトの作成

[Your First Extension | Visual Studio Code Extension API](https://code.visualstudio.com/api/get-started/your-first-extension)に従い、`Yoman`のジェネレータを使って vscode 拡張機能のプロジェクトを作成します。

もし、[microsoft/vscode-generator-code: Visual Studio Code extension generator](https://github.com/Microsoft/vscode-generator-code)をインストールしていない場合はインストールします。

```shell
npm install -g yo generator-code
```

次に、vscode 拡張機能のプロジェクトを作成しましょう。ここでは、言語に JavaScript を選択しています。
拡張機能名など質問されるので、適宜回答し、プロジェクトを作成してください。

```shell
yo code -t js --pkgManager npm --extensionId spike-playwright vscode-extension-e2etest-samples
```

`spike-playwright`という ID をもつ拡張機能のプロジェクトが `vscode-extension-e2etest-samples` に作成されます。
作成したプロジェクトに移動しましょう。

```shell
cd vscode-extension-e2etest-samples
```

### Playwright のインストール

Playwright のインストールについては、[Electron | Playwright](https://playwright.dev/docs/api/class-electron)を参考にする。

```shell
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i -D playwright@latest
```

## テストコードを書いてみる

今回は、E2E テストのテストコードは`e2e_test`フォルダーに作成したいと思います。

### 準備

`e2e_test`フォルダーを作成しましょう。

```shell
mkdir e2e_test
```

まずは、`test/suite`フォルダーをコピーして、`e2e_test/suite`を作成しましょう

```shell
cp -r ./test/suite ./e2e_test
```

次に、E2E テストは時間がかかるので、[e2e_test/suite/index.js](e2e_test/suite/index.js)のタイムアウト設定を変更します。
`mocha`ではテストのデフォルトタイムアウト閾値は`2000`ms になっているようです。

今回は、以下のように、`timeout: 0`として、タイムアウトを無効化しています。[^1]

```js
// e2e_test/suite/index.js

// ..略..
function run() {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    timeout: 0, // <= タイムアウトを無効化
  });
  // ..略..
}
// ..略..
```

さらに、今回は、[e2e_test/suite/index.js](e2e_test/suite/index.js)を直接実行したいので、呼び出し時に`run()`が実行されるように修正しましょう。

```js
// e2e_test/suite/index.js

// ...略...
function run() {
  // Create the mocha test
  const mocha = new Mocha({
    ui: "tdd",
    color: true,
    timeout: 0,
  });
  // ...略...
}

run();
/* module.exports = {
	run
}; */
```

以上で準備が整いました。

## テストの書き方

### テスト対象の確認

まずは、テスト対象の拡張機能をみてみましょう。

詳細は、[extension.js](extension.js)を参照してください。

以下の 2 つのコマンドを登録されています。

- spike-playwright.helloWorld: `Hello World from spike-playwright!`という通知メッセージを表示
- spike-playwright.helloInput: ユーザー入力を求め、`quick input: [ユーザー入力]`という通知メッセージを表示

これらのコマンドは、[package.json](package.json)に以下のように登録されています。
それぞれ、コマンドパレットで以下のタイトルで呼び出せます。

- `Hello Wrold`: spike-playwright.helloWorld
- `Hello Input`: spike-playwright.helloInput

```json
// package.json
// 略
"contributes": {
    "commands": [
      {
        "command": "spike-playwright.helloWorld",
        "category": "spike playwright",
        "title": "Hello World"
      },
      {
        "command": "spike-playwright.helloInput",
        "category": "spike playwright",
        "title": "Hello Input"
      }
    ]
  },
// 略
```

### テストコード

テストは、[e2e_test/suite/extension.test.js](e2e_test/suite/extension.test.js)に記載します。

[[Feature] VS Code as a Playwright target · Issue #22351 · microsoft/playwright](https://github.com/microsoft/playwright/issues/22351#issuecomment-1622366186)を参考に、`Playwright`経由で vscode を起動してテストしたいと思います。

テストケースは以下の 2 つです。

- test("コマンドパレットから helloworld 実行")
- test("コマンドパレットから HelloInput 実行")

そして、各テストケースの実行前後に、`setup`で`vscode`を起動し、`teardown`で`vscode`を終了しています。

以下が実際のテストコードです。

まず、`const window = await electronApp.firstWindow();`で`vsocde`の画面を取得し、

次にキーボード(`await window.keyboard.type("helloWorld", { delay: 100 });`など)を使って、コマンドパレットからコマンドを選択・実行しています。

注意点としては、各画面操作の前後で`await window.waitForTimeout(ミリ秒);`を指定する必要があります。

指定しないと画面が変化する前に、操作してしまう場合があり、うまくテストができません。

最後に、通知を取得するために、`awit window.locator(".notification-toast-container .monaco-list-row").first();`を使用し、取得した通知内の文字列を検証しています。

ここが難しいです。`vscode`の UI 部品がどのような CSS でマークアップされているかを知っている必要があります。

通知の UI 部品の CSS については[Notification · redhat-developer/vscode-extension-tester Wiki](https://github.com/redhat-developer/vscode-extension-tester/wiki/Notification)を参考にしています。[^2]

```js
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
```

### テストの実行

ターミナル内で以下を実行することでテストを実行できます。

```shell
node ./e2e_test/suite
```

また、`package.json`に`e2etest`を定義し、

```json
{
  // ...略...
  "scripts": {
    // ...略...
    "e2etest": "node ./e2e_test/suite"
  }
  // ...略...
}
```

以下によりテストを実行することもできます。

```shell
npm run e2etest
```

### デバッグ方法

`.vscode/launch.json`に以下を定義すれば、サイドバーの`実行とデバッグ`から`e2e test`を実行・デバッグできるようになります。

```json
{
  "version": "0.2.0",
  "configurations": [
    // ... 略 ...
    {
      "name": "e2e test",
      "program": "${workspaceFolder}/e2e_test/suite/index.js",
      "request": "launch",
      "skipFiles": ["<node_internals>/**"],
      "type": "node"
    }
  ]
}
```

### カバレッジ方法

[bcoe/c8: output coverage reports using Node.js' built in coverage](https://github.com/bcoe/c8)を利用してカバレッジを計測できます。

まず、`c8`をインストールしてください。

```shell
npm install -D c8
```

[.c8rc.json](.c8rc.json)のような設定ファイルを作成し、以下を実行します。

```shell
% npx c8 node ./e2e_test/suite

  Extension Test Suite
"before each" hook: vscodeをplaywriteで起動 for "コマンドパレットからhelloworld実行"
Found existing install in /Users/kanta/hacking/spike/003_vscode拡張機能のテスト方法調査/.vscode-test/vscode-darwin-1.83.0. Skipping download
type helloWorld..
    ✔ コマンドパレットからhelloworld実行 (18073ms)
"after each" hook: 起動したvscodeを終了 for "コマンドパレットからhelloworld実行"
"before each" hook: vscodeをplaywriteで起動 for "コマンドパレットからHelloInput実行"
Found existing install in /Users/kanta/hacking/spike/003_vscode拡張機能のテスト方法調査/.vscode-test/vscode-darwin-1.83.0. Skipping download
type hello input..
    ✔ コマンドパレットからHelloInput実行 (15634ms)
"after each" hook: 起動したvscodeを終了 for "コマンドパレットからHelloInput実行"


  2 passing (35s)

--------------|---------|----------|---------|---------|-------------------
File          | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
--------------|---------|----------|---------|---------|-------------------
All files     |     100 |      100 |     100 |     100 |
 extension.js |     100 |      100 |     100 |     100 |
--------------|---------|----------|---------|---------|-------------------
```

`./coverage/index.html`を開くと詳細なカバレッジレポートを確認できます。

## 参考

- [[Feature] VS Code as a Playwright target · Issue #22351 · microsoft/playwright](https://github.com/microsoft/playwright/issues/22351#issuecomment-1622366186)
- [vscode-test/lib/runTest.ts at main · microsoft/vscode-test](https://github.com/microsoft/vscode-test/blob/main/lib/runTest.ts#L126)

[^1]: 全てのテストのタイムアウトを無効化するのではなく、特定のテストにだけタイムアウト値を変更することもできます。([TIMEOUTS | Mocha - the fun, simple, flexible JavaScript test framework](https://mochajs.org/#timeouts))
[^2]: [vscode-extension-tester/locators/lib at main · redhat-developer/vscode-extension-tester](https://github.com/redhat-developer/vscode-extension-tester/tree/main/locators/lib)に CSS の定義があります
