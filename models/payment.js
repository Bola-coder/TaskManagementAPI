const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
  },

  amount: {
    type: Number,
  },

  nextPaymentDate: {
    type: Date,
  },
});

const Payments = mongoose.model("Payments", paymentSchema);

module.exports = Payments;
