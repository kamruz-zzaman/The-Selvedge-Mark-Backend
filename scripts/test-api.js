const axios = require("axios");

const API_URL = "http://localhost:5000/api";

const testApi = async () => {
  try {
    console.log("Starting API Verification...");

    // 1. Login as Admin
    console.log("\n1. Logging in as Admin...");
    const adminLogin = await axios.post(`${API_URL}/auth/login`, {
      email: "admin@example.com",
      password: "password123",
    });
    const adminToken = adminLogin.data.token;
    console.log("Admin logged in successfully");

    // 2. Create Product (Admin)
    console.log("\n2. Creating Product...");
    const productRes = await axios.post(
      `${API_URL}/products`,
      {
        name: "Test Jeans",
        description: "High quality denim",
        price: 50,
        category: "jeans",
        stock: 100,
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const productId = productRes.data.data._id;
    console.log(`Product created: ${productId}`);

    // 3. Register User
    console.log("\n3. Registering User...");
    const userEmail = `testuser${Date.now()}@example.com`;
    const userRes = await axios.post(`${API_URL}/auth/register`, {
      name: "Test User",
      email: userEmail,
      password: "password123",
    });
    const userToken = userRes.data.token;
    console.log(`User registered: ${userEmail}`);

    // 4. Create Order (User)
    console.log("\n4. Creating Order...");
    const orderRes = await axios.post(
      `${API_URL}/orders`,
      {
        orderItems: [
          {
            product: productId,
            quantity: 2,
          },
        ],
        shippingAddress: {
          address: "123 Test St",
          city: "Test City",
          postalCode: "12345",
          country: "Test Country",
        },
        paymentMethod: "credit_card",
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    const orderId = orderRes.data.data._id;
    console.log(`Order created: ${orderId}`);

    // 5. Verify Stock Update (Admin)
    console.log("\n5. Verifying Stock Update...");
    const productCheck = await axios.get(`${API_URL}/products/${productId}`);
    const currentStock = productCheck.data.data.stock;
    if (currentStock === 98) {
      console.log("Stock verified: 98");
    } else {
      console.error(`Stock mismatch: expected 98, got ${currentStock}`);
    }

    // 6. Process Payment
    console.log("\n6. Processing Payment...");
    await axios.post(
      `${API_URL}/payments`,
      {
        amount: 100,
        paymentMethod: "credit_card",
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log("Payment processed");

    // 7. Update Order to Paid (User)
    console.log("\n7. Updating Order to Paid...");
    await axios.put(
      `${API_URL}/orders/${orderId}/pay`,
      {
        id: "mock_pay_id",
        status: "completed",
        update_time: new Date().toISOString(),
        email_address: userEmail,
      },
      { headers: { Authorization: `Bearer ${userToken}` } }
    );
    console.log("Order marked as paid");

    console.log("\nAPI Verification Completed Successfully!");
  } catch (err) {
    console.error(
      "\nAPI Verification Failed:",
      err.response ? err.response.data : err.message
    );
  }
};

testApi();
