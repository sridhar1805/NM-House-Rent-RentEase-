const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userSchema = require("../schemas/userModel");
const propertySchema = require("../schemas/propertyModel");
const bookingSchema = require("../schemas/bookingModel");

//////for registering user//////
const registerController = async (req, res) => {
  try {
    const { email, password, type } = req.body;
    const existsUser = await userSchema.findOne({ email });

    if (existsUser) {
      return res.status(409).send({ message: "User already exists", success: false });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(password, salt);

    // Set granted status based on user type
    const granted = type === "Owner" ? "ungranted" : "granted";
    const newUser = new userSchema({ ...req.body, granted });

    await newUser.save();

    return res.status(201).send({ message: "Register Success", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: `Server error: ${error.message}` });
  }
};

////for login user/////
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userSchema.findOne({ email });

    if (!user) {
      return res.status(404).send({ message: "User not found", success: false });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send({ message: "Invalid email or password", success: false });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_KEY, { expiresIn: "1d" });
    user.password = undefined;

    return res.status(200).send({
      message: "Login successful",
      success: true,
      token,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: `Server error: ${error.message}` });
  }
};

//////forgot password////
const forgotPasswordController = async (req, res) => {
  try {
    const { email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const updatedUser = await userSchema.findOneAndUpdate(
      { email },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).send({ message: "User not found", success: false });
    }

    return res.status(200).send({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ success: false, message: `Server error: ${error.message}` });
  }
};

//////auth controller to check user data
const authController = async (req, res) => {
  try {
    const user = await userSchema.findById(req.body.userId);
    if (!user) {
      return res.status(404).send({ message: "User not found", success: false });
    }
    return res.status(200).send({ success: true, data: user });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Authorization error", success: false, error });
  }
};

//////get all properties//////
const getAllPropertiesController = async (req, res) => {
  try {
    const allProperties = await propertySchema.find();
    if (allProperties.length === 0) {
      return res.status(404).send({ message: "No properties available", success: false });
    }
    res.status(200).send({ success: true, data: allProperties });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error", success: false, error });
  }
};

//////booking handle//////
const bookingHandleController = async (req, res) => {
  try {
    const { propertyid } = req.params;
    const { userDetails, status, userId, ownerId } = req.body;

    const booking = new bookingSchema({
      propertyId: propertyid,
      userID: userId,
      ownerID: ownerId,
      userName: userDetails.fullName,
      phone: userDetails.phone,
      bookingStatus: status,
    });

    await booking.save();

    return res.status(200).send({ success: true, message: "Booking created successfully" });
  } catch (error) {
    console.error("Error handling booking:", error);
    return res.status(500).send({ success: false, message: "Booking handling error" });
  }
};

//////get all bookings for a single tenant//////
const getAllBookingsController = async (req, res) => {
  try {
    const { userId } = req.body;
    const getAllBookings = await bookingSchema.find({ userID: userId });

    if (getAllBookings.length === 0) {
      return res.status(404).send({ message: "No bookings found", success: false });
    }

    return res.status(200).send({ success: true, data: getAllBookings });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Internal server error", success: false });
  }
};

module.exports = {
  registerController,
  loginController,
  forgotPasswordController,
  authController,
  getAllPropertiesController,
  bookingHandleController,
  getAllBookingsController,
};
