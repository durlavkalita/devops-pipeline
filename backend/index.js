const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const db = new sqlite3.Database("./mydb.sqlite", (err) => {
  if (err) {
    console.error("Error opening database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL
  )
`);

const app = express();
app.use(express.json());
app.use(cors());

app.get("/healthz", (req, res) => res.json({ status: "ok" }));

app.get("/users", async (req, res) => {
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.post("/users", async (req, res) => {
  const { name } = req.body;
  const insertQuery = "INSERT INTO users (name) VALUES (?)";
  console.log(req.body);

  db.run(insertQuery, [name], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Fetch the newly inserted user by last inserted ID
    db.get("SELECT * FROM users WHERE id = ?", [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(row);
    });
  });
});

// Start the server on port 3000
app.listen(3000, () => console.log("Backend running on port 3000"));
