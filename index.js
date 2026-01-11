app.get("/test/", async (req, res) => {
  const url = req.query.URL;
  if (!url) {
    return res.status(400).type("text/plain").send("URL is required");
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // ⚠️ ВАЖНО: нормальный user-agent
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/120.0.0.0 Safari/537.36"
    );

    // ⚠️ Ждём ТОЛЬКО DOM, не networkidle
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // ⚠️ Ждём кнопку ДОЛЬШЕ
    await page.waitForSelector("#bt", { timeout: 20000 });

    await page.click("#bt");

    // Ждём, пока input заполнится
    await page.waitForFunction(
      () => document.querySelector("#inp")?.value,
      { timeout: 20000 }
    );

    const value = await page.$eval("#inp", el => el.value);

    res.type("text/plain").send(value);

  } catch (e) {
    console.error("TEST ERROR:", e);
    res.status(500).type("text/plain").send("error");
  } finally {
    if (browser) await browser.close();
  }
});
