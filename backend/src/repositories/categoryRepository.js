import Category from "../models/Category.js";

/**
 * Tạo danh mục mới
 */
export const createCategory = async ({ owner, name, isDefault = false }) => {
  return await Category.create({ owner, name, isDefault, posts: [] });
};

/**
 * Tìm tất cả danh mục của user
 */
export const findCategoriesByUser = async (userId) => {
  return await Category.find({ owner: userId }).populate({
    path: "posts",
    populate: { path: "author", select: "username avatar" },
    options: { strictPopulate: false },
  });
};

/**
 * Tìm danh mục theo ID (và có thể kiểm tra owner)
 */
export const findCategoryById = async (categoryId, ownerId = null) => {
  const query = { _id: categoryId };
  if (ownerId) query.owner = ownerId;
  return await Category.findOne(query).populate("posts");
};

/**
 * Cập nhật tên danh mục
 */
export const updateCategoryName = async (categoryId, ownerId, newName) => {
  return await Category.findOneAndUpdate(
    { _id: categoryId, owner: ownerId },
    { name: newName },
    { new: true }
  );
};

/**
 * Xóa danh mục (không cho xóa nếu là default)
 */
export const deleteCategory = async (categoryId, ownerId) => {
  const category = await Category.findOne({
    _id: categoryId,
    owner: ownerId,
  });
  if (!category) return null;
  if (category.isDefault) throw new Error("Không thể xóa danh mục mặc định");
  await category.deleteOne();
  return category;
};

/**
 * Thêm bài viết vào danh mục
 */
export const addPostToCategory = async (categoryId, ownerId, postId) => {
  const category = await Category.findOne({
    _id: categoryId,
    owner: ownerId,
  });
  if (!category) return null;

  if (!category.posts.includes(postId)) {
    category.posts.push(postId);
    await category.save();
  }
  return category.populate({
    path: "posts",
    populate: { path: "author", select: "username avatar" },
  });
};

/**
 * Xóa bài viết khỏi danh mục
 */
export const removePostFromCategory = async (categoryId, ownerId, postId) => {
  const category = await Category.findOne({
    _id: categoryId,
    owner: ownerId,
  });
  if (!category) return null;

  category.posts = category.posts.filter((p) => p.toString() !== postId);
  await category.save();
  return category.populate("posts");
};
