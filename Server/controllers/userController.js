const bcrypt = require("bcryptjs");
const User = require("../models/User");

// GET /api/user/profile
const getProfile = async (req, res) => {
  try {
    res.status(200).json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
};

// PUT /api/user/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phoneNumber, github, linkedin } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Name is required" });
    }

    // Basic URL validation for github/linkedin
    const urlPattern = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,})(\/\S*)?$/i;
    if (github && github.trim() && !urlPattern.test(github.trim())) {
      return res.status(400).json({ success: false, message: "Invalid GitHub URL" });
    }
    if (linkedin && linkedin.trim() && !urlPattern.test(linkedin.trim())) {
      return res.status(400).json({ success: false, message: "Invalid LinkedIn URL" });
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name: name.trim(), phoneNumber: phoneNumber || "", github: github || "", linkedin: linkedin || "" },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error("[UPDATE PROFILE ERROR]", error.message);
    res.status(500).json({ success: false, message: "Profile update failed" });
  }
};

// PUT /api/user/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ success: false, message: "New password must be different from current password" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("[CHANGE PASSWORD ERROR]", error.message);
    res.status(500).json({ success: false, message: "Password change failed" });
  }
};

module.exports = { getProfile, updateProfile, changePassword };
