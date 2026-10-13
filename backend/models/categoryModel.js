import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Categorie name is required"],
    unique: true,
    minlength: [2, "Category name must be at least 2 characters"],
    maxlength: [50, "Category name cannot exceed 50 characters"],
    trim: true,
  },
  image: {
    type: String,
    validate: {
      validator: function (value) {
        return /^https?:\/\/.+/i.test(value);
      },
      message: "Image must be a valid URL",
    },
  },
});

const Category = mongoose.model("Category", categorySchema);

export default Category;
