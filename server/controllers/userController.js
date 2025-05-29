import { userSignUpValidation } from "../helpers/authValidation.js";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { generateToken } from "../utils/createToken.js";
import envConfig from "../config/envConfig.js";
import cloudinary from "../utils/cloudinary.js";

const signup = async (req, res) => {
  try {
    console.log("hello");

    const { error } = userSignUpValidation.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      console.log(error);
      return res.status(403).json({ error: error.details });
    }
    const { fullName, email, password, bio } = req.body;

    const user = await User.findOne({ email });

    if (user) {
      return res.json({ success: false, message: "Account already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User({
      fullName,
      email,
      password: hashedPassword,
      bio,
    });

    await newUser.save();

    const token = generateToken(newUser._id);

    return res.json({
      success: true,
      userData: newUser,
      token,
      message: "User added successfully",
    });
  } catch (error) {
    console.log(error.message);

    res.json({ success: false, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { email: user.email, userId: user._id },
      envConfig.general.APP_KEY,
      { expiresIn: "24h" }
    );

    return res.status(200).json({
      message: "User login successfully",
      success: true,
      user,
      token,
      email,
      id: user._id,
      name: user.fullName,
    });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { fullName, bio } = req.body;

    const userId = req.user.userId;
    console.log("userId", req.user.userId);

    const profilePic = req.files?.find(
      (file) => file.fieldname === "profilePic"
    );

    let updatedUser;

    if (!profilePic) {
      updatedUser = await User.findByIdAndUpdate(
        userId,
        { bio, fullName },
        { new: true }
      );
    } else {
      const upload = await cloudinary.uploader.upload(profilePic.path);
      console.log("data", upload);

      updatedUser = await User.findByIdAndUpdate(
        userId,
        { profilePic: upload.secure_url, bio, fullName },
        { new: true }
      );
    }

    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.log(error.message);

    return res.json({ success: false, message: error.message });
  }
};

const checkAuth = (req, res) => {
  res.json({ success: true, user: req.user });
};

export { signup, login, updateProfile, checkAuth };
