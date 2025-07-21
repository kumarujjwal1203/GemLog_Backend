// // import express from "express";
// // import cors from "cors";
// // import mongoose from "mongoose";
// // import dotenv from "dotenv";
// // import path from "path";
// // import fs from "fs";
// // import { fileURLToPath } from "url";

// // import userRoutes from "./routes/userRoutes.js";
// // import postRoutes from "./routes/postRoutes.js";
// // import commentRoutes from "./routes/commentRoutes.js";

// // dotenv.config();

// // const app = express();
// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // // Create uploads directory if it doesn't exist
// // const uploadsDir = path.join(__dirname, "uploads");
// // if (!fs.existsSync(uploadsDir)) {
// //   fs.mkdirSync(uploadsDir, { recursive: true });
// // }

// // // Middleware
// // app.use(cors());
// // app.use(express.json());

// // app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // app.use("/user", userRoutes);
// // app.use("/posts", postRoutes);
// // app.use("/comments", commentRoutes);
// // mongoose
// //   .connect(process.env.MONGO_URL)
// //   .then(() => {
// //     console.log("Connected to MongoDB");
// //     app.listen(process.env.PORT || 3002, () => {
// //       console.log(`Server is running on port ${process.env.PORT || 3002}`);
// //     });
// //   })
// //   .catch((err) => {
// //     console.error("MongoDB connection error:", err);
// //   });

// import express from "express";
// import cors from "cors";
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// import path from "path";
// import fs from "fs";
// import { fileURLToPath } from "url";

// import userRoutes from "./routes/userRoutes.js";
// import postRoutes from "./routes/postRoutes.js";
// import commentRoutes from "./routes/commentRoutes.js";

// dotenv.config();
// const app = express();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Ensure 'uploads' directory exists
// const uploadsDir = path.join(__dirname, "uploads");
// if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// // Middlewares
// app.use(cors());
// app.use(express.json()); // for JSON body parsing
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// // Routes
// app.use("/user", userRoutes);
// app.use("/posts", postRoutes);
// app.use("/comments", commentRoutes);

// // Database & Server Start
// mongoose
//   .connect(process.env.MONGO_URL)
//   .then(() => {
//     console.log("✅ Connected to MongoDB");
//     app.listen(process.env.PORT || 3002, () => {
//       console.log(`🚀 Server running on port ${process.env.PORT || 3002}`);
//     });
//   })
//   .catch((err) => {
//     console.error("❌ MongoDB connection error:", err.message);
//   });

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Root test route
app.get("/", (req, res) => {
  res.send("🎉 GemLog Backend API is running!");
});

// API routes
app.use("/user", userRoutes);
app.use("/posts", postRoutes);
app.use("/comments", commentRoutes);

// Database connection and server start
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    const PORT = process.env.PORT || 3002;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });
