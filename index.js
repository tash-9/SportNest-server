const express = require('express')
const cors = require('cors')
const { jwtVerify, createRemoteJWKSet } = require('jose-cjs')
const dotenv = require('dotenv')
dotenv.config()

const app = express()
const port = process.env.PORT
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI


app.use(express.json())
const allowedOrigins = [
  'http://localhost:3000', process.env.CLIENT_URI, process.env.CLIENT_LIVE_URL 
  ].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URI}/api/auth/jwks`)
)

const middleware = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "unauthorized" });
  }
  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }
  try {
    const { payload } = await jwtVerify(token, JWKS);
    req.user = payload;   // ← attach payload so routes can use it
    next();
  } catch {
    return res.status(403).json({ message: "unauthorized" });
  }
};


async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully");

    const database = client.db('sportnest');
    const facilityCollection = database.collection('facility')
    const bookingCollection = database.collection('booking')


    app.get('/all-facilities', async (req, res) => {
      const { search, category } = req.query;
      //res.json(result);

      let query = {};
      const conditions = [];
 
      if (search) {
        conditions.push({
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { facility_type: { $regex: search, $options: 'i' } },
            { location: { $regex: search, $options: 'i' } },
          ]
        });
      }

      if (category) {
        conditions.push({ facility_type: category });
      }

      if (conditions.length > 0) {
        query = conditions.length === 1 ? conditions[0] : { $and: conditions };
      }

      const result = await facilityCollection.find(query).toArray();
      res.json(result);
    });

    app.post('/my-bookings', middleware, async (req, res) => {
  const booking = req.body;

  booking.user_email = req.user.email; 
  booking.status = "pending"; // default status

  try {
    const result = await bookingCollection.insertOne(booking);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to create booking", error: err.message });
  }
});
    app.get('/my-bookings', middleware, async (req, res) => {
      const email = req.user.email;
      const result = await bookingCollection.find({ user_email: email }).toArray();
      res.json(result);
    })

    app.delete('/my-bookings/:id', middleware, async (req, res) => {
      const id = req.params.id;
      const email = req.user.email;

      const booking = await bookingCollection.findOne({ _id: new ObjectId(id) });
      if (!booking) return res.status(404).json({ message: "Booking not found" });
      if (booking.user_email !== email) {
        return res.status(403).json({ message: "Forbidden: Cannot delete other users' bookings" });
      }

      const result = await bookingCollection.deleteOne({ _id: new ObjectId(id) });
      res.json(result);
    });

    app.post('/all-facilities', middleware, async (req, res) => {
      const add = req.body
      const result = await facilityCollection.insertOne(add);
      res.json(result)
    })

    app.get('/featured-facilities', async (req, res) => {
      const result = await facilityCollection.find().limit(6).toArray()
      res.json(result)
    })

    app.get('/all-facilities/:id', middleware, async (req, res) => {
      const id = req.params.id

      const query = {
        _id: new ObjectId(id)
      }

      const result = await facilityCollection.findOne(query)
      res.json(result)
    })

    app.patch('/all-facilities/:id', middleware, async (req, res) => {
  const id = req.params.id;
  const email = req.user.email;

  const facility = await facilityCollection.findOne({ _id: new ObjectId(id) });
  if (!facility) return res.status(404).json({ message: "Not found" });
  if (facility.owner_email !== email) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const result = await facilityCollection.updateOne(
    { _id: new ObjectId(id) },
    { $set: req.body }
  );
    res.json(result);
  });

app.delete('/all-facilities/:id', middleware, async (req, res) => {
  const id = req.params.id;
  const email = req.user.email;

  const facility = await facilityCollection.findOne({ _id: new ObjectId(id) });
  if (!facility) return res.status(404).json({ message: "Not found" });
  if (facility.owner_email !== email) {
    return res.status(403).json({ message: "Forbidden" });
  }

  const result = await facilityCollection.deleteOne({ _id: new ObjectId(id) });
  res.json(result);
  });

  app.get('/manage-my-facilities', middleware, async (req, res) => {
    const result = await facilityCollection.find({ owner_email: req.user.email }).toArray()
    res.json(result)
  })

  } finally {
      // await client.close();
  }
}
run().catch(console.dir);

app.get('/', (req, res) => {
  res.send('SportNest Server is running')
})

app.listen(port, () => {
  console.log(`The server listening on port ${port}`)
})