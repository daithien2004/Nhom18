// schemas/categorySchema.js
import { z } from "zod";

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tên danh mục là bắt buộc" })
    .max(100, { message: "Tên danh mục không được quá 100 ký tự" }),
});

export const updateCategorySchema = z.object({
  name: z
    .string()
    .min(1, { message: "Tên danh mục là bắt buộc" })
    .max(100, { message: "Tên danh mục không được quá 100 ký tự" }),
});

export const categoryIdSchema = z.object({
  categoryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "ID danh mục không hợp lệ" }),
});

export const addPostToCategorySchema = z.object({
  postId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "ID bài viết không hợp lệ" }),
});
