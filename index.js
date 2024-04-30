const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvzse1f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("inkScapeDB").collection("users");
    const artsCollection = client.db("inkScapeDB").collection("arts");

    // user related apis

    app.get("/users", async (req, res) => {
      const cursor = usersCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const users = req.body;
      console.log(users);
      const result = await usersCollection.insertOne(users);
      res.send(result);
      console.log(result);
    });

    // art related api

    app.get("/arts", async (req, res) => {
      const cursor = artsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/arts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await artsCollection.findOne(query);
      console.log(id, query, result);
      res.send(result);
    });

    app.get("/myArt/:email", async (req, res) => {
      const email = req.params.email;
      const result = await artsCollection.find({ userEmail: email }).toArray();
      res.send(result);
    });

    app.post("/arts", async (req, res) => {
      const newArt = req.body;
      console.log(newArt);
      const result = await artsCollection.insertOne(newArt);
      res.send(result);
    });

    app.put("/arts/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedArt = req.body;
      const art = {
        $set: {
          itemName: updatedArt.itemName,
          subcategory: updatedArt.subcategory,
          price: updatedArt.price,
          rating: updatedArt.rating,
          customization: updatedArt.customization,
          stockStatus: updatedArt.stockStatus,
          photo: updatedArt.photo,
          processingTime: updatedArt.processingTime,
          shortDescription: updatedArt.shortDescription,
        },
      };

      const result = await artsCollection.updateOne(filter, art, options);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Ink Scape server is running");
});

app.listen(port, () => {
  console.log(`Ink Scape server is running on port: ${port}`);
});
