// @desc    Record cash on delivery payment
// @route   POST /api/payments
// @access  Private
exports.recordCashOnDelivery = async (req, res) => {
  try {
    const { orderId } = req.body;

    // Simply acknowledge the cash on delivery payment method
    const paymentResult = {
      id: `cod_${Date.now()}`,
      status: "pending", // Will be completed upon delivery
      method: "cash_on_delivery",
      update_time: new Date().toISOString(),
    };

    res.status(200).json({
      success: true,
      message: "Cash on delivery payment method recorded",
      data: paymentResult,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Failed to record payment method",
    });
  }
};
