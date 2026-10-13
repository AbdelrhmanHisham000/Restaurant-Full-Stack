import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import userRouter from "./routes/userRoutes.js";
import categoryRouter from "./routes/categoryRoutes.js";
import productRouter from "./routes/productRoutes.js";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import cartRouter from "./routes/cartRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import dashboardRouter from "./routes/dashboardRoutes.js";
import reviewsRouter from "./routes/reviewRoutes.js";
import hpp from "hpp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// CORS - allow Next.js frontend
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// set security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests from this IP, please try again in an hour",
});

app.use("/api", limiter);

app.set("query parser", "extended");
// Body parser
app.use(express.json({ limit: "10kb" }));

// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Data sanitization against noSQL query injection
/*
API : Login
{
"email":{"$gt":""}
"password":'pass123
}
*/
// To remove data using these defaults:
// app.use(mongoSanitize());
// Data sanitization against XSS

// Against paramter Pollution
app.use(hpp());

app.get("/", (req, res) => {
  res.send("Hello World");
});
// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/reviews", reviewsRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// Global Error Handler

app.use((err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    status: err.status || "error",
    message: err.message || "Something went wrong",
  });
});

export default app;
