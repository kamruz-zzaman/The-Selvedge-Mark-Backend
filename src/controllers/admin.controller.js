const Product = require("../models/Product");
const Category = require("../models/Category");

// @desc    Migrate product categories from strings to ObjectIds
// @route   POST /api/admin/migrate-categories
// @access  Private/Admin
exports.migrateCategories = async (req, res) => {
  try {
    // Create default categories if they don't exist
    const categoryMap = {
      jeans: "Jeans",
      jackets: "Jackets",
      shirts: "Shirts",
      accessories: "Accessories",
      denim: "Denim",
    };

    const createdCategories = {};

    for (const [slug, name] of Object.entries(categoryMap)) {
      let category = await Category.findOne({ slug });

      if (!category) {
        category = await Category.create({
          name,
          slug,
          description: `${name} category`,
        });
      }

      createdCategories[slug] = category._id;
    }

    // Get all products with lean() to get plain objects
    const products = await Product.find({}).lean();

    let updated = 0;
    let skipped = 0;
    let errors = [];

    for (const product of products) {
      try {
        // Check if category is a string (old format)
        if (typeof product.category === "string") {
          const categorySlug = product.category.toLowerCase();
          let categoryId = createdCategories[categorySlug];

          // If no exact match, use first available category
          if (!categoryId) {
            categoryId = Object.values(createdCategories)[0];
          }

          await Product.updateOne(
            { _id: product._id },
            { $set: { category: categoryId } }
          );
          updated++;
        } else {
          skipped++;
        }
      } catch (error) {
        errors.push({
          productId: product._id,
          productName: product.name,
          error: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Migration completed",
      data: {
        totalProducts: products.length,
        updated,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
        categories: Object.keys(createdCategories).map((slug) => ({
          slug,
          id: createdCategories[slug],
        })),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
