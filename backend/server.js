import "dotenv/config";

import app from "./app.js";
import connectDB from "./config/db.js";

const PORT = 5000;

// // To use Variables
// dotenv.config();

// Start DB
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
