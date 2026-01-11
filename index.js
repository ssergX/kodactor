import express from "express";
import puppeteer from "puppeteer";

const app = express();

app.get("/login/", (_, res) => {
  res.type("text/plain").send("55f8dfa4-b500-4da9-8049-369ff6b94074");
});

app.get("/test/", async (req, res) => {
  const url = req.query.URL;
  if (!url) return res.status(400).type("text/plain").send("URL is required");

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });

    await page.waitForSelector("#bt", { timeout: 5000 });
    await page.click("#bt");

    await page.waitForFunction(() => document.querySelector("#inp")?.value, { timeout: 5000 });
    const value = await page.$eval("#inp", (el) => el.value);

    res.type("text/plain").send(value);
  } catch (e) {
    console.error(e);
    res.status(500).type("text/plain").send("error");
  } finally {
    if (browser) await browser.close();
  }
});

const PORT = process.env.PORT || 10000; // на Render часто используют 10000 по умолчанию
app.listen(PORT, () => console.log("Listening on", PORT));
