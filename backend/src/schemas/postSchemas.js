import { z } from "zod";

// Schema cho tạo bài viết
export const createPostSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Nội dung là bắt buộc" })
    .max(5000, { message: "Nội dung không được quá 5000 ký tự" }),

  images: z
    .array(z.string().url({ message: "Ảnh phải là URL hợp lệ" }))
    .max(10, { message: "Không được quá 10 ảnh" })
    .optional()
    .default([]),
});

// Schema cho cập nhật bài viết
export const updatePostSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Nội dung là bắt buộc" })
    .max(5000, { message: "Nội dung không được quá 5000 ký tự" })
    .optional(),

  images: z
    .array(z.string().url({ message: "Ảnh phải là URL hợp lệ" }))
    .max(10, { message: "Không được quá 10 ảnh" })
    .optional(),
});

// Schema cho tạo bình luận
export const createCommentSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Nội dung bình luận là bắt buộc" })
    .max(1000, { message: "Bình luận không được quá 1000 ký tự" }),
});

// Schema cho cập nhật bình luận
export const updateCommentSchema = z.object({
  content: z
    .string()
    .min(1, { message: "Nội dung bình luận là bắt buộc" })
    .max(1000, { message: "Bình luận không được quá 1000 ký tự" }),
});

// Schema cho query parameters
export const postQuerySchema = z.object({
  page: z.coerce
    .number()
    .min(1, { message: "Trang phải lớn hơn 0" })
    .default(1),
  limit: z.coerce
    .number()
    .min(1, { message: "Giới hạn tối thiểu là 1" })
    .max(100, { message: "Giới hạn tối đa là 100" })
    .default(10),
  search: z.string().max(100).optional(),
  sortBy: z.enum(["createdAt", "updatedAt", "views"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

// Schema cho ID parameters
export const postIdSchema = z.object({
  postId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "ID bài viết không hợp lệ" }),
});

export const commentIdSchema = z.object({
  commentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { message: "ID bình luận không hợp lệ" }),
});

export const sharePostSchema = z.object({
  caption: z
    .string()
    .max(5000, { message: "Nội dung không được quá 5000 ký tự" })
    .optional()
    .default(""),
});
