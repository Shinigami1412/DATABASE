// server/index.js
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Mẫu data sách
const books = [
  { id: 1, title: "Doraemon", price: 50000, img: "/images/doraemon.jpg" },
  { id: 2, title: "Harry Potter", price: 120000, img: "/images/harrypotter.jpg" },
  { id: 3, title: "Conan", price: 80000, img: "/images/conan.jpg" },
];

app.get("/api/books", (req, res) => {
  res.json(books);
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
