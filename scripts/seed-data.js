const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../src/models/User");
const Product = require("../src/models/Product");
const Order = require("../src/models/Order");
const Inventory = require("../src/models/Inventory");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});
    await Order.deleteMany({});
    await Inventory.deleteMany({});
    console.log("Cleared existing data");

    // Create Admin User
    const admin = await User.create({
      name: "Admin User",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      status: "active",
    });
    console.log("Admin user created");

    // Create Sample Customers
    const customers = await User.create([
      {
        name: "John Smith",
        email: "john@example.com",
        password: "password123",
        phone: "+1 (555) 123-4567",
        role: "user",
        status: "active",
        createdAt: new Date("2023-06-15"),
      },
      {
        name: "Sarah Johnson",
        email: "sarah@example.com",
        password: "password123",
        phone: "+1 (555) 234-5678",
        role: "user",
        status: "active",
        createdAt: new Date("2023-08-22"),
      },
      {
        name: "Mike Davis",
        email: "mike@example.com",
        password: "password123",
        phone: "+1 (555) 345-6789",
        role: "user",
        status: "active",
        createdAt: new Date("2023-03-10"),
      },
      {
        name: "Emily Brown",
        email: "emily@example.com",
        password: "password123",
        phone: "+1 (555) 456-7890",
        role: "user",
        status: "active",
        createdAt: new Date("2023-11-05"),
      },
      {
        name: "Chris Wilson",
        email: "chris@example.com",
        password: "password123",
        phone: "+1 (555) 567-8901",
        role: "user",
        status: "blocked",
        createdAt: new Date("2024-01-12"),
      },
    ]);
    console.log("Sample customers created");

    // Create Sample Products
    const products = await Product.create([
      {
        name: "Classic Selvedge Denim Jeans",
        sku: "SDJ-001",
        description:
          "Premium selvedge denim jeans with authentic shuttle-loom construction",
        price: 189.99,
        category: "jeans",
        stock: 45,
        status: "active",
        images: ["/denim-jeans.png"],
      },
      {
        name: "Raw Denim Jacket",
        sku: "RDJ-002",
        description: "Classic raw denim jacket with copper rivets",
        price: 249.99,
        category: "jackets",
        stock: 23,
        status: "active",
        images: ["/classic-denim-jacket.png"],
      },
      {
        name: "Vintage Wash Jeans",
        sku: "VWJ-003",
        description: "Vintage-inspired wash with authentic fading",
        price: 169.99,
        category: "jeans",
        stock: 8,
        status: "active",
        images: ["/vintage-jeans.png"],
      },
      {
        name: "Slim Fit Selvedge",
        sku: "SFS-004",
        description: "Modern slim fit with selvedge details",
        price: 199.99,
        category: "jeans",
        stock: 0,
        status: "inactive",
        images: ["/slim-jeans.png"],
      },
      {
        name: "Denim Shirt",
        sku: "DS-005",
        description: "Classic denim shirt in indigo blue",
        price: 129.99,
        category: "shirts",
        stock: 34,
        status: "active",
        images: ["/denim-shirt.png"],
      },
    ]);
    console.log("Sample products created");

    // Create Inventory for Products
    const inventory = await Inventory.create([
      {
        product: products[0]._id,
        stock: 45,
        reserved: 5,
        reorderPoint: 20,
      },
      {
        product: products[1]._id,
        stock: 23,
        reserved: 2,
        reorderPoint: 15,
      },
      {
        product: products[2]._id,
        stock: 8,
        reserved: 1,
        reorderPoint: 15,
      },
      {
        product: products[3]._id,
        stock: 0,
        reserved: 0,
        reorderPoint: 20,
      },
      {
        product: products[4]._id,
        stock: 34,
        reserved: 3,
        reorderPoint: 25,
      },
    ]);
    console.log("Inventory created");

    // Create Sample Orders
    const orders = await Order.create([
      {
        user: customers[0]._id,
        products: [
          { product: products[0]._id, quantity: 1, price: 189.99 },
          { product: products[4]._id, quantity: 1, price: 129.99 },
        ],
        shippingAddress: {
          address: "123 Main St",
          city: "New York",
          postalCode: "10001",
          country: "USA",
        },
        paymentMethod: "cash_on_delivery",
        totalPrice: 319.98,
        payment: "paid",
        status: "processing",
        createdAt: new Date("2024-01-15"),
      },
      {
        user: customers[1]._id,
        products: [{ product: products[1]._id, quantity: 1, price: 249.99 }],
        shippingAddress: {
          address: "456 Oak Ave",
          city: "Los Angeles",
          postalCode: "90001",
          country: "USA",
        },
        paymentMethod: "cash_on_delivery",
        totalPrice: 249.99,
        payment: "paid",
        status: "shipped",
        createdAt: new Date("2024-01-15"),
      },
      {
        user: customers[2]._id,
        products: [
          { product: products[0]._id, quantity: 2, price: 189.99 },
          { product: products[2]._id, quantity: 1, price: 169.99 },
        ],
        shippingAddress: {
          address: "789 Pine Rd",
          city: "Chicago",
          postalCode: "60601",
          country: "USA",
        },
        paymentMethod: "cash_on_delivery",
        totalPrice: 549.97,
        payment: "paid",
        status: "delivered",
        createdAt: new Date("2024-01-14"),
      },
      {
        user: customers[3]._id,
        products: [{ product: products[4]._id, quantity: 1, price: 129.99 }],
        shippingAddress: {
          address: "321 Elm St",
          city: "Houston",
          postalCode: "77001",
          country: "USA",
        },
        paymentMethod: "cash_on_delivery",
        totalPrice: 129.99,
        payment: "pending",
        status: "pending",
        createdAt: new Date("2024-01-14"),
      },
      {
        user: customers[2]._id,
        products: [
          { product: products[1]._id, quantity: 2, price: 249.99 },
          { product: products[0]._id, quantity: 1, price: 189.99 },
        ],
        shippingAddress: {
          address: "789 Pine Rd",
          city: "Chicago",
          postalCode: "60601",
          country: "USA",
        },
        paymentMethod: "cash_on_delivery",
        totalPrice: 689.97,
        payment: "paid",
        status: "processing",
        createdAt: new Date("2024-01-13"),
      },
    ]);
    console.log("Sample orders created");

    console.log("\n✅ Seed data created successfully!");
    console.log("\nLogin credentials:");
    console.log("Admin: admin@example.com / password123");
    console.log("User: john@example.com / password123");

    process.exit();
  } catch (err) {
    console.error("Error seeding data:", err);
    process.exit(1);
  }
};

seedData();
