import Product from "../models/productModel.js";
import Review from "../models/reviewModel.js";
import successResponse from "../utils/successResponse.js";

export async function createReview(req, res, next) {
  const { product: productId } = req.body;

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      status: "Fail",
      message: "Product not found",
    });
  }

  const newReview = await Review.create({
    ...req.body,
    user: req.user._id,
  });
  successResponse(res, "Review Created Successfully", newReview);
}

export async function getReviewsByUserId(req, res, next) {
  const userID = req.user._id;

  const reviews = await Review.findOne({ user: userID });
  successResponse(res, `${req.user.name} Reviews`, reviews);
}

export async function getReviewsByProductId(req, res, next) {
  const { productId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    return res.status(404).json({
      status: "Fail",
      message: "Product not found",
    });
  }

  const reviews = await Review.findOne({ product: productId });
  successResponse(res, `${req.user.name} Reviews`, reviews);
}

export async function getAllReviews(req, res, next) {
  const reviews = await Review.find();
  successResponse(res, "All Reviews", reviews);
}
