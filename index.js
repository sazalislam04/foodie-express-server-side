const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const jwt = require("jsonwebtoken");
const port = process.env.PORT || 5000;
require("dotenv").config();
app.use(cors());
app.use(express.json());

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

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
    if (err) {
      return res.status(401).send({ message: "unauthorized access" });
    }
    req.decoded = decoded;
    next();
  });
}

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

const reviewsCollection = client.db("foodie").collection("reviews");

app.get("/services", async (req, res) => {
  try {
    const query = {};
    const cursor = foodsCollection.find(query);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

app.get("/services/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: ObjectId(id) };
    const result = await foodsCollection.findOne(query);
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

// get service
app.get("/services", async (req, res) => {
  const query = {};
  const cursor = foodsCollection.find(query);
  const result = await cursor.toArray();
  res.send(result);
});

// add service
app.post("/services", async (req, res) => {
  try {
    const addService = req.body;
    const result = await foodsCollection.insertOne(addService);
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

// jwt token
app.post("/jwt", (req, res) => {
  const user = req.body;
  const id = req.params;
  const token = jwt.sign(user, id, process.env.ACCESS_TOKEN, {
    expiresIn: "1h",
  });
  res.send({ token });
});

app.get("/reviews", verifyJWT, async (req, res) => {
  try {
    const decoded = req.decoded;
    if (decoded.email !== req.query.email) {
      res.status(403).send({ message: "Forbidden access" });
    }
    let query = {};
    if (req.query.email) {
      query = {
        email: req.query.email,
      };
    } else {
      query = {
        id: req.query.id,
      };
    }
    const cursor = reviewsCollection.find(query);
    const result = await cursor.sort({ timestamp: -1 }).toArray();
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

app.post("/reviews", async (req, res) => {
  try {
    const review = req.body;
    const result = await reviewsCollection.insertOne(review, {
      timestamp: new Date(),
    });
    if (result.insertedId) {
      res.send({
        success: true,
        message: "Thanks For Review",
      });
    } else {
      res.send({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.log(error);
  }
});

app.get("/home-services", async (req, res) => {
  try {
    const cursor = foodsCollection.find({}).sort({ _id: -1 }).limit(3);
    const result = await cursor.toArray();
    res.send(result);
  } catch (error) {
    console.log(error.message);
  }
});

// delete
app.delete("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const query = { _id: ObjectId(id) };
    const result = await reviewsCollection.deleteOne(query);
    if (result.deletedCount) {
      res.send({
        success: true,
        message: "Review Deleted Successfully",
      });
    } else {
      res.send({
        success: false,
        error: "Review Already Deleted",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
});

// updated
app.patch("/reviews/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.body;
    const query = { _id: ObjectId(id) };
    const updatedDoc = {
      $set: {
        name: user.name,
        email: user.email,
        review: user.review,
      },
    };
    const result = await reviewsCollection.updateOne(query, updatedDoc);

    if (result.matchedCount) {
      res.send({
        success: true,
        message: "Review Updated successfully",
      });
    } else {
      res.send({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
});

app.listen(port, () => {
  console.log(`Foodie express servier running on port ${port}`);
});
