import express from "express";

const app = express();
const LOGIN = "cerg0909"; // Твой логин

// Ссылка на скрипт с логикой (функция f(n))
const SECRET_SCRIPT_URL = "https://kodaktor.ru/j/51e39e4";

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  next();
});

app.get("/login", (req, res) => {
  res.send(LOGIN);
});

// --- УНИВЕРСАЛЬНАЯ ФУНКЦИЯ ОБРАБОТКИ (ХАКЕРСКАЯ) ---
const zombieHandler = async (req, res) => {
  try {
    let num = req.params.num;

    if (!num) {
      num = Object.keys(req.query)[0];
    }

    if (!num) {
      return res.status(400).send("Error: No number provided");
    }

    console.log(`Calculating for: ${num}`);

    const response = await fetch(SECRET_SCRIPT_URL);
    if (!response.ok) throw new Error("Script not found");
    const scriptCode = await response.text();

    const calculate = new Function(scriptCode + `; return f(${num});`);

    const result = calculate();

    console.log(`Result: ${result}`);

    res.send(String(result));
  } catch (error) {
    console.error(error);
    res.status(500).send("Error: " + error.message);
  }
};

// Ловит /zombie?1234
app.get("/zombie", zombieHandler);

// Ловит /zombie/1234
app.get("/zombie/:num", zombieHandler);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
