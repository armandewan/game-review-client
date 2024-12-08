const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();

const port = process.env.PORT || 5000;

const app = express();
// middleWere
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rebh4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const collection = client.db("game-review").collection("review");
    const watchListCollection = client.db("game-review").collection("watchList");

    //review post route
    app.post("/addReview", async (req, res) => {
      try {
        await collection.insertOne(req.body);
        res.json({ message: "Review Created Successfully" });
      } catch (error) {
        console.log(error);
        res.json({ message: "Internal Server Error" });
      }
    });

    //all review get route
    app.get("/all", async (req, res) => {
      const cursor = collection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    //get review by id
    app.get("/review/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const review = await collection.findOne(query);
      res.send(review);
    });

    // get review by email
    app.get('/review/user/:email',async(req,res)=>{
      const {email} = req.params;
      const query = {email};
      const result = await collection.find(query).toArray();
      res.send(result);      
    })

    //post watchList
    app.post("/addWatchList", async (req, res) => {
      try {
        await watchListCollection.insertOne(req.body);
        res.json({ message: "Watch List Added Successfully" });
      } catch (error) {
        console.log(error);
        res.json({ message: "Internal Server Error" });
      }
    });

    //get watchList
    app.get('/watchList/user/:email',async(req,res)=>{
      const {email} = req.params;
      const query = {email};
      const result = await watchListCollection.find(query).toArray();
      res.send(result);      
    })
    // user review delete
      app.delete('/review/:id',async(req,res)=>{
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await collection.deleteOne(query)
        res.send(result); 
    })
    //user review update
      app.put('/review/:id',async(req,res)=>{
        const id = req.params.id;
        const filter = {_id: new ObjectId(id)};
        const updateReview = {
          $set: req.body
         }
        const result =await collection.updateOne(filter,updateReview);
        res.send(result);      
      })

      //get review according to rating
    app.get('/reviewByRating', async(req, res)=>{
      const data = await collection.find().sort({ rating: -1 }).limit(6).toArray();
      res.send(data)
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`this server is running by : ${port}`);
});
