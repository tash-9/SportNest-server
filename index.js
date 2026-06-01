const express = require("express");
const cors = require("cors");
const { jwtVerify, createRemoteJWKSet } = require("jose-cjs");
const dotenv = require("dotenv");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const uri = process.env.MONGODB_URI;

app.use(express.json());

const allowedOrigins = [
  "http://localhost:3000",
  process.env.CLIENT_URI,
  process.env.CLIENT_LIVE_URL,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let isConnected = false;
let facilityCollection;
let bookingCollection;

async function getCollections() {
  if (!uri) {
    throw new Error("MONGODB_URI is missing");
  }

  if (!isConnected) {
    await client.connect();
    isConnected = true;
    console.log("MongoDB connected successfully");
  }

  const database = client.db("sportnest");

  facilityCollection = database.collection("facility");
  bookingCollection = database.collection("booking");

  return {
    facilityCollection,
    bookingCollection,
  };
}

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URI}/api/auth/jwks`)
);

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
    req.user = payload;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "unauthorized",
      error: err.message,
    });
  }
};

app.get("/", (req, res) => {
  res.send("SportNest server is running");
});

app.get("/health", async (req, res) => {
  res.json({
    message: "Server is alive",
    mongodb: process.env.MONGODB_URI ? "MONGODB_URI exists" : "MONGODB_URI missing",
    clientUri: process.env.CLIENT_URI || "CLIENT_URI missing",
    clientLiveUrl: process.env.CLIENT_LIVE_URL || "CLIENT_LIVE_URL missing",
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const { facilityCollection } = await getCollections();
    const facilityCount = await facilityCollection.countDocuments();

    res.json({
      message: "MongoDB connected",
      facilityCount,
    });
  } catch (err) {
    res.status(500).json({
      message: "MongoDB connection failed",
      error: err.message,
    });
  }
});

app.post("/seed-facilities", async (req, res) => {
  try {
    const { facilityCollection } = await getCollections();

    const seedSecret = req.headers["x-seed-secret"];

    if (!process.env.SEED_SECRET || seedSecret !== process.env.SEED_SECRET) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const facilities = [
      {
        name: "Elite Football Turf",
        facility_type: "Football",
        image: "https://images.unsplash.com/photo-1556056504-5c7696c4c28d",
        location: "Dhanmondi, Dhaka",
        price_per_hour: 1500,
        capacity: 12,
        available_slots: ["08:00 AM", "10:00 AM", "04:00 PM"],
        description: "A premium football turf with lighting and seating.",
        owner_email: "admin@sportnest.com",
        booking_count: 0,
      },
      {
        name: "GreenZone Football Arena",
        facility_type: "Football",
        image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20",
        location: "Mirpur, Dhaka",
        price_per_hour: 1200,
        capacity: 10,
        available_slots: ["09:00 AM", "03:00 PM", "07:00 PM"],
        description: "Well-maintained football ground for friendly matches.",
        owner_email: "admin@sportnest.com",
        booking_count: 0,
      },
      {
        name: "Boundary Cricket Ground",
        facility_type: "Cricket",
        image: "https://images.unsplash.com/photo-1531415074968-036ba1b575da",
        location: "Uttara, Dhaka",
        price_per_hour: 1800,
        capacity: 22,
        available_slots: ["07:00 AM", "02:00 PM", "06:00 PM"],
        description: "Open cricket ground suitable for practice and matches.",
        owner_email: "admin@sportnest.com",
        booking_count: 0,
      },
      {
        name: "PowerPlay Cricket Nets",
        facility_type: "Cricket",
        image: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972",
        location: "Bashundhara, Dhaka",
        price_per_hour: 900,
        capacity: 8,
        available_slots: ["08:00 AM", "12:00 PM", "05:00 PM"],
        description: "Cricket practice nets with quality pitch surface.",
        owner_email: "admin@sportnest.com",
        booking_count: 0,
      },
      {
        name: "Ace Tennis Court",
        facility_type: "Tennis",
        image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6",
        location: "Gulshan, Dhaka",
        price_per_hour: 1300,
        capacity: 4,
        available_slots: ["07:00 AM", "11:00 AM", "05:00 PM"],
        description: "Outdoor tennis court with professional surface.",
        owner_email: "admin@sportnest.com",
        booking_count: 0,
      },
      {
        name: "CourtSide Tennis Club",
        facility_type: "Tennis",
        image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8",
        location: "Baridhara, Dhaka",
        price_per_hour: 1400,
        capacity: 4,
        available_slots: ["08:00 AM", "02:00 PM", "07:00 PM"],
        description: "Premium tennis court for singles and doubles games.",
        owner_email: "admin@sportnest.com",
        booking_count: 0,
      },
      {
        name: "BlueWave Swimming Pool",
        facility_type: "Swimming",
        image: "https://images.unsplash.com/photo-1572331165267-854da2b10ccc",
        location: "Farmgate, Dhaka",
        price_per_hour: 1000,
        capacity: 20,
        available_slots: ["06:00 AM", "12:00 PM", "04:00 PM"],
        description: "Clean swimming pool with safe changing facilities.",
        owner_email: "admin@sportnest.com",
        booking_count: 0,
      },
      {
        name: "AquaFit Swim Center",
        facility_type: "Swimming",
        image: "https://images.unsplash.com/photo-1560089000-7433a4ebbd64",
        location: "Banasree, Dhaka",
        price_per_hour: 950,
        capacity: 18,
        available_slots: ["07:00 AM", "03:00 PM", "06:00 PM"],
        description: "Modern swimming facility for fitness and training.",
        owner_email: "admin@sportnest.com",
        booking_count: 0,
      },
      {
        name: "HoopZone Basketball Court",
        facility_type: "Basketball",
        image: "https://images.unsplash.com/photo-1546519638-68e109498ffc",
        location: "Mohakhali, Dhaka",
        price_per_hour: 1100,
        capacity: 10,
        available_slots: ["09:00 AM", "05:00 PM", "09:00 PM"],
        description: "Spacious basketball court for casual and team games.",
        owner_email: "admin@sportnest.com",
        booking_count: 0,
      },
      {
        name: "Urban Volleyball Arena",
        facility_type: "Volleyball",
        image: "https://images.unsplash.com/photo-1479859546309-cd77fa21c8f6",
        location: "Wari, Dhaka",
        price_per_hour: 1000,
        capacity: 10,
        available_slots: ["08:00 AM", "01:00 PM", "07:00 PM"],
        description: "Outdoor volleyball court with a friendly game setup.",
        owner_email: "admin@sportnest.com",
        booking_count: 0,
      },
    ];

    await facilityCollection.deleteMany({
      owner_email: "admin@sportnest.com",
    });

    const result = await facilityCollection.insertMany(facilities);

    res.json({
      message: "Facilities seeded successfully",
      insertedCount: result.insertedCount,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to seed facilities",
      error: err.message,
    });
  }
});

app.get("/all-facilities", async (req, res) => {
  try {
    const { facilityCollection } = await getCollections();

    const { search, category } = req.query;

    let query = {};
    const conditions = [];

    if (search) {
      conditions.push({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { facility_type: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } },
        ],
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
  } catch (err) {
    res.status(500).json({
      message: "Failed to load facilities",
      error: err.message,
    });
  }
});

app.get("/featured-facilities", async (req, res) => {
  try {
    const { facilityCollection } = await getCollections();

    const result = await facilityCollection.find().limit(6).toArray();
    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load featured facilities",
      error: err.message,
    });
  }
});

app.get("/all-facilities/:id", async (req, res) => {
  try {
    const { facilityCollection } = await getCollections();

    const id = req.params.id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid facility id" });
    }

    const result = await facilityCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!result) {
      return res.status(404).json({ message: "Facility not found" });
    }

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load facility",
      error: err.message,
    });
  }
});

app.post("/all-facilities", middleware, async (req, res) => {
  try {
    const { facilityCollection } = await getCollections();

    const add = req.body;

    if (typeof add.available_slots === "string") {
      add.available_slots = add.available_slots
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    add.owner_email = req.user.email;
    add.price_per_hour = Number(add.price_per_hour);
    add.capacity = Number(add.capacity);
    add.booking_count = Number(add.booking_count || 0);

    const result = await facilityCollection.insertOne(add);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to add facility",
      error: err.message,
    });
  }
});

app.patch("/all-facilities/:id", middleware, async (req, res) => {
  try {
    const { facilityCollection } = await getCollections();

    const id = req.params.id;
    const email = req.user.email;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid facility id" });
    }

    const facility = await facilityCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    if (facility.owner_email !== email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const updateData = req.body;

    if (typeof updateData.available_slots === "string") {
      updateData.available_slots = updateData.available_slots
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (updateData.price_per_hour !== undefined) {
      updateData.price_per_hour = Number(updateData.price_per_hour);
    }

    if (updateData.capacity !== undefined) {
      updateData.capacity = Number(updateData.capacity);
    }

    delete updateData._id;
    delete updateData.owner_email;

    const result = await facilityCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to update facility",
      error: err.message,
    });
  }
});

app.delete("/all-facilities/:id", middleware, async (req, res) => {
  try {
    const { facilityCollection } = await getCollections();

    const id = req.params.id;
    const email = req.user.email;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid facility id" });
    }

    const facility = await facilityCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!facility) {
      return res.status(404).json({ message: "Facility not found" });
    }

    if (facility.owner_email !== email) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const result = await facilityCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete facility",
      error: err.message,
    });
  }
});

app.get("/manage-my-facilities", middleware, async (req, res) => {
  try {
    const { facilityCollection } = await getCollections();

    const result = await facilityCollection
      .find({ owner_email: req.user.email })
      .toArray();

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load your facilities",
      error: err.message,
    });
  }
});

app.post("/my-bookings", middleware, async (req, res) => {
  try {
    const { bookingCollection } = await getCollections();

    const booking = req.body;

    booking.user_email = req.user.email;
    booking.status = "pending";
    booking.hours = Number(booking.hours);
    booking.total_price = Number(booking.total_price);

    const result = await bookingCollection.insertOne(booking);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to create booking",
      error: err.message,
    });
  }
});

app.get("/my-bookings", middleware, async (req, res) => {
  try {
    const { bookingCollection } = await getCollections();

    const result = await bookingCollection
      .find({ user_email: req.user.email })
      .toArray();

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to load bookings",
      error: err.message,
    });
  }
});

app.delete("/my-bookings/:id", middleware, async (req, res) => {
  try {
    const { bookingCollection } = await getCollections();

    const id = req.params.id;
    const email = req.user.email;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid booking id" });
    }

    const booking = await bookingCollection.findOne({
      _id: new ObjectId(id),
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.user_email !== email) {
      return res.status(403).json({
        message: "Forbidden: Cannot delete other users' bookings",
      });
    }

    const result = await bookingCollection.deleteOne({
      _id: new ObjectId(id),
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({
      message: "Failed to delete booking",
      error: err.message,
    });
  }
});

app.listen(port, () => {
  console.log(`The server listening on port ${port}`);
});
