import * as categoryService from "../services/categoryService.js";
import { sendSuccess } from "../utils/response.js";
import { asyncHandler } from "../middlewares/asyncHandler.js";

/**
 * Tạo danh mục mới
 */
export const createCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.createCategory({
    ownerId: req.user.id,
    name: req.body.name,
  });
  return sendSuccess(res, category, "Tạo danh mục thành công", 201);
});

/**
 * Lấy danh sách danh mục của user
 */
export const getUserCategories = asyncHandler(async (req, res) => {
  const categories = await categoryService.getUserCategories(req.user.id);
  return sendSuccess(res, categories, "Lấy danh sách danh mục thành công");
});

/**
 * Đổi tên danh mục
 */
export const renameCategory = asyncHandler(async (req, res) => {
  const updated = await categoryService.renameCategory(
    req.params.categoryId,
    req.user.id,
    req.body.name
  );
  return sendSuccess(res, updated, "Cập nhật tên danh mục thành công");
});

/**
 * Xóa danh mục
 */
export const deleteCategory = asyncHandler(async (req, res) => {
  await categoryService.deleteCategory(req.params.categoryId, req.user.id);
  return sendSuccess(res, null, "Xóa danh mục thành công");
});

/**
 * Thêm bài viết vào danh mục
 */
export const savePostToCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.savePostToCategory(
    req.params.categoryId,
    req.user.id,
    req.body.postId
  );
  return sendSuccess(res, category, "Lưu bài viết vào danh mục thành công");
});

/**
 * Xóa bài viết khỏi danh mục
 */
export const removePostFromCategory = asyncHandler(async (req, res) => {
  const category = await categoryService.removePostFromCategory(
    req.params.categoryId,
    req.user.id,
    req.params.postId
  );
  return sendSuccess(res, category, "Xóa bài viết khỏi danh mục thành công");
});
