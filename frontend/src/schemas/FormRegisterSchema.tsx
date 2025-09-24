import { z } from 'zod';

export const FormRegisterRequestOtpSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'Tên người dùng phải có ít nhất 3 ký tự' })
    .max(50, { message: 'Tên người dùng không được quá 50 ký tự' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới',
    }),
  email: z.string().email({ message: 'Vui lòng cung cấp một email hợp lệ' }),
  password: z
    .string()
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    .max(50, { message: 'Mật khẩu không được quá 50 ký tự' }),
  phone: z
    .string()
    .regex(/^[0-9]{10,11}$/, { message: 'Số điện thoại phải có 10-11 chữ số' }),
});

export const FormRegisterVerifyOtpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: 'OTP phải có đúng 6 chữ số' })
    .regex(/^\d{6}$/, { message: 'OTP chỉ được chứa số' }),
});

export type FormRegisterRequestOtp = z.infer<
  typeof FormRegisterRequestOtpSchema
>;
export type FormRegisterVerifyOtp = z.infer<typeof FormRegisterVerifyOtpSchema>;
