const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express());

app.get("/", (req, res) => {
  res.send("Foodie Express server running");
});

// mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bts619l.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    console.log("database connect");
  } catch (error) {
    console.log(error.name, error.message);
  }
}
run();

const foodsCollection = client.db("foodie").collection("services");

app.get("/foods", async (req, res) => {
  try {
    const query = {};
    const cursor = foodsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(port, () => {
  console.log(`Foodie express servier running on port ${port}`);
});
