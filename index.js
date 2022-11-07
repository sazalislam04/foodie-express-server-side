const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express());

app.get("/", (req, res) => {
  res.send("Foodie Express server running");
});

app.listen(port, () => {
  console.log(`Foodie express servier running on port ${port}`);
});
