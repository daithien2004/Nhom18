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

export type FormForgotPasswordRequestOtp = z.infer<
  typeof FormForgotPasswordRequestOtpSchema
>;
export type FormForgotPasswordReset = z.infer<
  typeof FormForgotPasswordResetSchema
>;
