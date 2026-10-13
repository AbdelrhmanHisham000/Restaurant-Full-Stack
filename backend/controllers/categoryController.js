import Category from "../models/categoryModel.js";
import successResponse from "../utils/successResponse.js";

export async function createCategory(req, res, next) {
  const category = await Category.create({
    name: req.body.name,
  });

  successResponse(res, "Category Created Successfully", category);
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;

    const category = await Category.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
      strict: "throw",
    });

    if (!category) {
      return next(new AppError("Category not found", 404));
    }

    return successResponse(res, "Category Updated Successfully", category);
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  const id = req.params.id;
  await Category.findByIdAndDelete(id);
  successResponse(res, "Category Deleted Successfully");
}

export async function getCategoryById(req, res, next) {
  const id = req.params.id;

  const category = await Category.findById(id);

  successResponse(res, "Category Retrieved Successfully", category);
}

export async function getAllCategories(req, res, next) {
  const categories = await Category.find();

  successResponse(res, "Categories Retrieved Successfully", categories);
}
