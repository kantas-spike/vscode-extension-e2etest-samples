# spike-playwright

vscode拡張機能のテストでユーザー入力を扱う方法を調べたい。

[[Feature] VS Code as a Playwright target · Issue #22351 · microsoft/playwright](https://github.com/microsoft/playwright/issues/22351#issuecomment-1622366186)が使えそうかも?
ということで、少し試してみる。

Playwrightのインストールについては、[Electron | Playwright](https://playwright.dev/docs/api/class-electron)を参考にする。

## 環境構築

~~~shell
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i -D playwright@latest @playwright/test@latest
~~~

## テスト方法

以下により、playwrightを利用したe2eテストを実行できる。

~~~shell
npm run e2etest
~~~

## 参考

- [vscode-test/sample/src/test/runTest.ts at main · microsoft/vscode-test](https://github.com/microsoft/vscode-test/blob/main/sample/src/test/runTest.ts)
- [vscode-test/lib/runTest.ts at main · microsoft/vscode-test](https://github.com/microsoft/vscode-test/blob/main/lib/runTest.ts#L126)
- [javascript - Mocha Global Scoping Issues - Stack Overflow](https://stackoverflow.com/questions/20737252/mocha-global-scoping-issues)