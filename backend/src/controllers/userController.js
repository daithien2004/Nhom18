import { User } from "../models/index.js";
import { updateProfile, updateUserImage } from "../services/userService.js";

// Lấy thông tin profile của user hiện tại
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select(
      "-password -otp -otpExpires"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error("Error getting profile:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
export const handleUpdateProfile = async (req, res) => {
  try {
    const userId = req.user.id; // lấy từ middleware JWT
    const updates = req.body;

    const updatedUser = await updateProfile(userId, updates);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (updatedUser.error) {
      return res.status(400).json({ message: updatedUser.error });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in handleUpdateProfile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const updateAvatar = async (req, res) => {
  try {
    const user = await updateUserImage(req.user.id, req.file, "avatar");
    res.json({
      success: true,
      message: "Cập nhật avatar thành công",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateCoverPhoto = async (req, res) => {
  try {
    const user = await updateUserImage(req.user.id, req.file, "coverPhoto");
    res.json({
      success: true,
      message: "Cập nhật ảnh bìa thành công",
      user,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
