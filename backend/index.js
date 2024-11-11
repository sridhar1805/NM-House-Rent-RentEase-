const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Initialize Express
const app = express();

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectionofDb = async () => {
  try {
    await mongoose.connect(process.env.MONGO_DB, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1); // Exit process if connection fails
  }
};
connectionofDb();

// Middleware
app.use(express.json());
app.use(cors());

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use('/api/user', require('./routes/userRoutes.js'));
app.use('/api/admin', require('./routes/adminRoutes.js'));
app.use('/api/owner', require('./routes/ownerRoutes.js'));

// Define port and start server
const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
