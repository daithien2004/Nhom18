import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log("Cloudinary Config Test:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
    ? "***" + process.env.CLOUDINARY_API_SECRET.slice(-4)
    : "NOT_SET",
});

// Test upload
async function testUpload() {
  try {
    // Tạo một file test nhỏ
    const testImage = Buffer.from(
      "R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=",
      "base64"
    );

    const result = await cloudinary.uploader.upload(
      `data:image/gif;base64,${testImage.toString("base64")}`,
      {
        folder: "test_uploads",
        public_id: "test_image",
        overwrite: true,
      }
    );

    console.log("✅ Upload successful:", result.secure_url);
    return result;
  } catch (error) {
    console.error("❌ Upload failed:", error.message);
    throw error;
  }
}

// Chạy test
testUpload().catch(console.error);
