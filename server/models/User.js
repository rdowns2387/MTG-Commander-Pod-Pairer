const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    pin: {
      type: String,
      required: [true, "PIN is required"],
      minlength: 4,
      maxlength: 60, // Hashed length will be longer
    },
    inQueue: {
      type: Boolean,
      default: false,
    },
    readyForNextGame: {
      type: Boolean,
      default: false,
    },
    lastPodTime: {
      type: Date,
      default: null,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isGuest: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save middleware to hash the PIN
UserSchema.pre("save", async function (next) {
  if (!this.isModified("pin")) {
    return next();
  }

  try {
    // Ensure PIN is exactly 4 digits
    if (!/^\d{4}$/.test(this.pin)) {
      throw new Error("PIN must be exactly 4 digits");
    }

    const salt = await bcrypt.genSalt(10);
    this.pin = await bcrypt.hash(this.pin, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare PIN
UserSchema.methods.matchPin = async function (enteredPin) {
  return await bcrypt.compare(enteredPin, this.pin);
};

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
