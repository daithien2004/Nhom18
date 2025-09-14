import { z } from "zod";

export const FormLoginSchema = z.object({
  email: z.string().email("Vui lòng cung cấp một email hợp lệ"),
  password: z.string()
    .min(1, "Mật khẩu là bắt buộc")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

export type FormLogin = z.infer<typeof FormLoginSchema>;
