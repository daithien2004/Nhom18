import { z } from "zod";

export const FormCreatePostSchema = z.object({
  title: z.string()
    .min(5, { message: "Tiêu đề phải có ít nhất 5 ký tự" })
    .max(200, { message: "Tiêu đề không được quá 200 ký tự" }),
  content: z.string()
    .min(10, { message: "Nội dung phải có ít nhất 10 ký tự" })
    .max(5000, { message: "Nội dung không được quá 5000 ký tự" }),
  tags: z.array(z.string())
    .max(10, { message: "Không được quá 10 thẻ tag" })
    .optional()
    .default([]),
  isPublic: z.boolean()
    .optional()
    .default(true)
});

export const FormUpdatePostSchema = z.object({
  title: z.string()
    .min(5, { message: "Tiêu đề phải có ít nhất 5 ký tự" })
    .max(200, { message: "Tiêu đề không được quá 200 ký tự" })
    .optional(),
  content: z.string()
    .min(10, { message: "Nội dung phải có ít nhất 10 ký tự" })
    .max(5000, { message: "Nội dung không được quá 5000 ký tự" })
    .optional(),
  tags: z.array(z.string())
    .max(10, { message: "Không được quá 10 thẻ tag" })
    .optional(),
  isPublic: z.boolean()
    .optional()
});

export const FormCreateCommentSchema = z.object({
  content: z.string()
    .min(1, { message: "Bình luận không được để trống" })
    .max(1000, { message: "Bình luận không được quá 1000 ký tự" }),
});

export const FormUpdateUserSchema = z.object({
  username: z.string()
    .min(3, { message: "Tên người dùng phải có ít nhất 3 ký tự" })
    .max(50, { message: "Tên người dùng không được quá 50 ký tự" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới" })
    .optional(),
  phone: z.string()
    .regex(/^[0-9]{10,11}$/, { message: "Số điện thoại phải có 10-11 chữ số" })
    .optional(),
  bio: z.string()
    .max(500, { message: "Tiểu sử không được quá 500 ký tự" })
    .optional()
});

export type FormCreatePost = z.infer<typeof FormCreatePostSchema>;
export type FormUpdatePost = z.infer<typeof FormUpdatePostSchema>;
export type FormCreateComment = z.infer<typeof FormCreateCommentSchema>;
export type FormUpdateUser = z.infer<typeof FormUpdateUserSchema>;
