import ApiError from "../utils/apiError.js";
import { StatusCodes } from "http-status-codes";
import * as categoryRepo from "../repositories/postCategoryRepository.js";
import * as postRepo from "../repositories/postRepository.js";

/**
 * Tạo danh mục mới cho user
 */
export const createCategory = async ({ ownerId, name }) => {
  if (!name || !name.trim()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Tên danh mục không được để trống"
    );
  }
  return await categoryRepo.createCategory({ owner: ownerId, name });
};

/**
 * Lấy tất cả danh mục của user
 */
export const getUserCategories = async (userId) => {
  return await categoryRepo.findCategoriesByUser(userId);
};

/**
 * Đổi tên danh mục
 */
export const renameCategory = async (categoryId, ownerId, newName) => {
  if (!newName || !newName.trim()) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Tên danh mục không được để trống"
    );
  }
  const updated = await categoryRepo.updateCategoryName(
    categoryId,
    ownerId,
    newName
  );
  if (!updated) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy danh mục");
  }
  return updated;
};

/**
 * Xóa danh mục (chặn xóa danh mục mặc định)
 */
export const deleteCategory = async (categoryId, ownerId) => {
  try {
    return await categoryRepo.deleteCategory(categoryId, ownerId);
  } catch (err) {
    if (err.message.includes("mặc định")) {
      throw new ApiError(StatusCodes.BAD_REQUEST, err.message);
    }
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy danh mục");
  }
};

/**
 * Thêm bài viết vào danh mục
 */
export const savePostToCategory = async (categoryId, ownerId, postId) => {
  const post = await postRepo.findPostById(postId);
  if (!post) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy bài viết");
  }

  const category = await categoryRepo.addPostToCategory(
    categoryId,
    ownerId,
    postId
  );
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy danh mục");
  }
  return category;
};

/**
 * Xóa bài viết khỏi danh mục
 */
export const removePostFromCategory = async (categoryId, ownerId, postId) => {
  const category = await categoryRepo.removePostFromCategory(
    categoryId,
    ownerId,
    postId
  );
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Không tìm thấy danh mục");
  }
  return category;
};
