# Product Category Migration Guide

## Problem

Existing products in the database have string-based category values (e.g., "shirts", "jeans") but the Product model now expects ObjectId references to the Category model. This causes errors when creating orders.

## Solution

Run the category migration endpoint to update all existing products.

---

## Option 1: Using the Migration Script (Recommended)

### Step 1: Set your admin credentials

```bash
cd selvedge-backend
export ADMIN_EMAIL="your-admin@email.com"
export ADMIN_PASSWORD="your-admin-password"
```

### Step 2: Run the migration

```bash
node scripts/run-migration.js
```

---

## Option 2: Using curl/Postman

### Step 1: Login as admin

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@selvedgemark.com","password":"admin123"}'
```

Copy the `token` from the response.

### Step 2: Run migration

```bash
curl -X POST http://localhost:5000/api/admin/migrate-categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## What the Migration Does

1. **Creates default categories** if they don't exist:

   - Jeans
   - Jackets
   - Shirts
   - Accessories
   - Denim

2. **Updates all products** with string categories to use ObjectId references

3. **Returns a summary** showing:
   - Total products processed
   - Number updated
   - Number skipped (already migrated)
   - Any errors

---

## After Migration

Once the migration is complete, you can:

- ✅ Create manual orders without errors
- ✅ Add new products with proper category references
- ✅ Use the category management system

---

## Troubleshooting

### Error: 403 Forbidden

- Make sure you're using valid admin credentials
- Check that the admin user exists in the database

### Error: Connection refused

- Make sure the backend server is running (`pnpm run dev`)
- Check that it's running on port 5000

### Error: Category validation failed

- This means the migration hasn't run yet
- Follow the steps above to run it

---

## Files Created

- **Controller**: `src/controllers/admin.controller.js`
- **Routes**: `src/routes/admin.routes.js`
- **Migration Script**: `scripts/run-migration.js`
- **Migration Guide**: `scripts/MIGRATION_GUIDE.md` (this file)
