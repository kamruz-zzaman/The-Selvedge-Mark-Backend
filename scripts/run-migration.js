#!/usr/bin/env node

/**
 * Migration Script: Product Categories
 *
 * This script migrates existing products with string-based categories
 * to use ObjectId references to the Category model.
 *
 * Usage: node scripts/run-migration.js
 */

const axios = require("axios");

const API_URL = process.env.API_URL || "http://localhost:5000";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@selvedgemark.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

async function runMigration() {
  try {
    console.log("🔐 Logging in as admin...");

    // Login to get token
    const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });

    const token = loginResponse.data.token;
    console.log("✅ Login successful\n");

    console.log("🔄 Running category migration...");

    // Run migration
    const migrationResponse = await axios.post(
      `${API_URL}/api/admin/migrate-categories`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("\n✅ Migration completed successfully!\n");
    console.log("📊 Results:");
    console.log(JSON.stringify(migrationResponse.data.data, null, 2));
  } catch (error) {
    console.error("\n❌ Migration failed:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Error:", error.response.data.error || error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

runMigration();
