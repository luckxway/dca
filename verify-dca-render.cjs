const path = require("path");
const { chromium } = require("C:/Users/aaron/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright-core@1.60.0/node_modules/playwright-core");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  });
  const results = [];
  const viewports = [
    { name: "mobile", width: 390, height: 844 },
    { name: "desktop", width: 1366, height: 900 }
  ];

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    const errors = [];
    page.on("pageerror", error => errors.push(String(error)));
    page.on("console", message => {
      if (["error", "warning"].includes(message.type())) {
        errors.push(`${message.type()}: ${message.text()}`);
      }
    });

    await page.goto("http://127.0.0.1:8790/dca-crypto-calculator.html", {
      waitUntil: "domcontentloaded",
      timeout: 15000
    });
    await page.waitForTimeout(9000);

    const result = await page.evaluate(() => ({
      title: document.querySelector("h1")?.textContent,
      status: document.querySelector("#statusText")?.textContent,
      returnPct: document.querySelector("#returnPct")?.textContent,
      errorVisible: getComputedStyle(document.querySelector("#errorBox")).display !== "none",
      chartHeight: Math.round(document.querySelector("#dcaChart")?.getBoundingClientRect().height || 0),
      bodyWidth: document.body.scrollWidth,
      viewportWidth: innerWidth,
      shareHeadline: document.querySelector("#shareHeadline")?.textContent
    }));

    results.push({ viewport: viewport.name, result, errors });
    await page.screenshot({ path: path.join(__dirname, `${viewport.name}-dca-check.png`), fullPage: false });
    await page.close();
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch(error => {
  console.error(error);
  process.exit(1);
});
