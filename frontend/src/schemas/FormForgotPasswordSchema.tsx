import { z } from 'zod';

export const FormForgotPasswordRequestOtpSchema = z.object({
  email: z.string().email({ message: 'Vui lòng cung cấp một email hợp lệ' }),
});

export const FormForgotPasswordResetSchema = z.object({
  email: z.string().email({ message: 'Vui lòng cung cấp một email hợp lệ' }),
  otp: z
    .string()
    .length(6, { message: 'OTP phải có đúng 6 chữ số' })
    .regex(/^\d{6}$/, { message: 'OTP chỉ được chứa số' }),
});

// Schema mới cho đặt mật khẩu
export const FormNewPasswordSchema = z
  .object({
    email: z.string().email('Email không hợp lệ'),
    otp: z.string().length(6, 'OTP phải có 6 chữ số'),
    newPassword: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type FormForgotPasswordRequestOtp = z.infer<
  typeof FormForgotPasswordRequestOtpSchema
>;
export type FormForgotPasswordReset = z.infer<
  typeof FormForgotPasswordResetSchema
>;

export type FormNewPassword = z.infer<typeof FormNewPasswordSchema>;
