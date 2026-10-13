import sharp from "sharp";
import Product from "../models/productModel.js";
import { APIFeatures } from "../utils/ApiFeatuers.js";
import successResponse from "../utils/successResponse.js";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

export const uploadProductPhoto = upload.single("image");

export async function resizeProductPhoto(req, res, next) {
  if (!req.file) return next();

  const ext = req.file.mimetype.split("/")[1];
  req.file.filename = `product-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({ quality: 90 })
    .toFile(path.join(uploadsDir, req.file.filename));

  next();
}

// Get All Products
export const getAllProducts = async (req, res) => {
  try {
    const features = new APIFeatures(
      Product.find().populate("category", "name"),
      req.query,
    )
      .filter()
      .sort()
      .limitFields()
      .paginate()
      .search();

    const products = await features.query;

    return successResponse(res, "Products fetched successfully", products);
  } catch (err) {
    return res.status(500).json({
      status: "Fail",
      message: err.message,
    });
  }
};

// Get Product By ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "Fail",
        message: "Product not found",
      });
    }

    return successResponse(res, "Product fetched successfully", product);
  } catch (err) {
    return res.status(500).json({
      status: "Fail",
      message: err.message,
    });
  }
};

// Create Product
export const createProduct = async (req, res) => {
  try {
    const productData = { ...req.body };

    // Handle image file
    if (req.file) {
      productData.image = req.file.filename;
    }

    // Parse ingredients if it comes as a JSON string
    if (typeof productData.ingredients === "string") {
      try {
        productData.ingredients = JSON.parse(productData.ingredients);
      } catch {
        productData.ingredients = productData.ingredients
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    await Product.create(productData);

    return successResponse(res, "Product created successfully", null, 201);
  } catch (err) {
    return res.status(400).json({
      status: "Fail",
      message: err.message,
    });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle image file
    if (req.file) {
      updateData.image = req.file.filename;
    }

    // Parse ingredients if it comes as a JSON string
    if (typeof updateData.ingredients === "string") {
      try {
        updateData.ingredients = JSON.parse(updateData.ingredients);
      } catch {
        updateData.ingredients = updateData.ingredients
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    }

    // Convert isAvailable string to boolean
    if (typeof updateData.isAvailable === "string") {
      updateData.isAvailable = updateData.isAvailable === "true";
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      {
        returnDocument: "after",
        runValidators: true,
      },
    );

    if (!product) {
      return res.status(404).json({
        status: "Fail",
        message: "Product not found",
      });
    }

    return successResponse(res, "Product updated successfully");
  } catch (err) {
    return res.status(400).json({
      status: "Fail",
      message: err.message,
    });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: "Fail",
        message: "Product not found",
      });
    }

    return successResponse(res, "Product deleted successfully");
  } catch (err) {
    return res.status(500).json({
      status: "Fail",
      message: err.message,
    });
  }
};
