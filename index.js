import express from "express";
import puppeteer from "puppeteer";

const app = express();

/* ===== middleware ===== */
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  next();
});

// обязательно для Render healthcheck
app.get("/", (_, res) => {
  res.type("text/plain").send("OK");
});

app.options("*", (_, res) => {
  res.sendStatus(200);
});

/* ===== routes ===== */

app.get("/login/", (_, res) => {
  res.type("text/plain").send("55f8dfa4-b500-4da9-8049-369ff6b94074");
});

app.get("/test/", async (req, res) => {
  const targetURL = req.query.URL;
  if (!targetURL) {
    return res.status(400).type("text/plain").send("URL is required");
  }

  let browser;

  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) " +
      "Chrome/120.0.0.0 Safari/537.36"
    );

    // ⚠️ НЕ networkidle2
    await page.goto(targetURL, {
      waitUntil: "load",
      timeout: 60000,
    });

    // ищем кнопку и в main DOM, и в iframe
    const button = await page.waitForFunction(() => {
      const main = document.querySelector("#bt");
      if (main) return main;

      for (const iframe of document.querySelectorAll("iframe")) {
        try {
          const doc = iframe.contentDocument;
          const btn = doc && doc.querySelector("#bt");
          if (btn) return btn;
        } catch (_) {}
      }
      return false;
    }, { timeout: 60000 });

    await button.evaluate(btn => btn.click());

    const value = await page.waitForFunction(() => {
      const main = document.querySelector("#inp");
      if (main && main.value) return main.value;

      for (const iframe of document.querySelectorAll("iframe")) {
        try {
          const doc = iframe.contentDocument;
          const inp = doc && doc.querySelector("#inp");
          if (inp && inp.value) return inp.value;
        } catch (_) {}
      }
      return false;
    }, { timeout: 60000 });

    res.type("text/plain").send(String(await value.jsonValue()));

  } catch (e) {
    console.error("TEST ERROR:", e);
    res.status(500).type("text/plain").send("error");
  } finally {
    if (browser) await browser.close();
  }
});

/* ===== start ===== */

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("Listening on", PORT);
});
