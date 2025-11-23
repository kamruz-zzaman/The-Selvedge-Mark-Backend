const mongoose = require("mongoose");
const Product = require("../src/models/Product");
const Category = require("../src/models/Category");
const connectDB = require("../src/config/db");

const migrateProductCategories = async () => {
  try {
    await connectDB();
    console.log("MongoDB Connected...");

    // Create default categories if they don't exist
    const categoryMap = {
      jeans: "Jeans",
      jackets: "Jackets",
      shirts: "Shirts",
      accessories: "Accessories",
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
        console.log(`Created category: ${name}`);
      }

      createdCategories[slug] = category._id;
    }

    // Get all products
    const products = await Product.find({}).lean();
    console.log(`Found ${products.length} products to migrate`);

    let updated = 0;
    let skipped = 0;

    for (const product of products) {
      // Check if category is a string (old format)
      if (typeof product.category === "string") {
        const categorySlug = product.category.toLowerCase();
        const categoryId = createdCategories[categorySlug];

        if (categoryId) {
          await Product.updateOne(
            { _id: product._id },
            { $set: { category: categoryId } }
          );
          console.log(`Updated product: ${product.name} -> ${categorySlug}`);
          updated++;
        } else {
          console.log(
            `Warning: No category found for "${product.category}" in product: ${product.name}`
          );
          // Set to first available category as fallback
          const firstCategoryId = Object.values(createdCategories)[0];
          await Product.updateOne(
            { _id: product._id },
            { $set: { category: firstCategoryId } }
          );
          console.log(`Set product "${product.name}" to default category`);
          updated++;
        }
      } else {
        skipped++;
      }
    }

    console.log("\n=== Migration Complete ===");
    console.log(`Updated: ${updated} products`);
    console.log(`Skipped: ${skipped} products (already migrated)`);
    console.log(`Total: ${products.length} products`);

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
};

migrateProductCategories();
