import { z } from 'zod';

// Schema cho đăng nhập
export const loginSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email không hợp lệ' })
    .min(1, { message: 'Email là bắt buộc' }),
  password: z
    .string()
    .min(1, { message: 'Mật khẩu là bắt buộc' })
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' }),
});

// Schema cho yêu cầu OTP đăng ký
export const registerRequestOtpSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email không hợp lệ' })
    .min(1, { message: 'Email là bắt buộc' }),
  password: z
    .string()
    .min(1, { message: 'Mật khẩu là bắt buộc' })
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    .max(50, { message: 'Mật khẩu không được quá 50 ký tự' }),
});

// Schema cho xác thực OTP đăng ký
export const registerVerifyOtpSchema = z.object({
  username: z
    .string()
    .min(1, { message: 'Tên người dùng là bắt buộc' })
    .min(3, { message: 'Tên người dùng phải có ít nhất 3 ký tự' })
    .max(50, { message: 'Tên người dùng không được quá 50 ký tự' })
    .regex(/^[a-zA-Z0-9_]+$/, {
      message: 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới',
    }),
  email: z
    .string()
    .email({ message: 'Email không hợp lệ' })
    .min(1, { message: 'Email là bắt buộc' }),
  otp: z
    .string()
    .min(1, { message: 'OTP là bắt buộc' })
    .length(6, { message: 'OTP phải có đúng 6 chữ số' })
    .regex(/^\d{6}$/, { message: 'OTP chỉ được chứa số' }),
  password: z
    .string()
    .min(1, { message: 'Mật khẩu là bắt buộc' })
    .min(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    .max(50, { message: 'Mật khẩu không được quá 50 ký tự' }),
  phone: z
    .string()
    .min(1, { message: 'Số điện thoại là bắt buộc' })
    .regex(/^[0-9]{10,11}$/, { message: 'Số điện thoại phải có 10-11 chữ số' }),
});

// Schema cho yêu cầu OTP quên mật khẩu
export const forgotPasswordRequestOtpSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email không hợp lệ' })
    .min(1, { message: 'Email là bắt buộc' }),
});

// Schema cho reset mật khẩu với OTP
export const forgotPasswordResetSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email không hợp lệ' })
    .min(1, { message: 'Email là bắt buộc' }),
  otp: z
    .string()
    .min(1, { message: 'OTP là bắt buộc' })
    .length(6, { message: 'OTP phải có đúng 6 chữ số' })
    .regex(/^\d{6}$/, { message: 'OTP chỉ được chứa số' }),
});

// Schema cho cập nhật thông tin người dùng
export const updateUserSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: 'Tên người dùng phải có ít nhất 3 ký tự' })
      .max(50, { message: 'Tên người dùng không được quá 50 ký tự' })
      .regex(/^[a-zA-Z0-9_]+$/, {
        message: 'Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới',
      })
      .optional(),
    phone: z
      .string()
      .regex(/^[0-9]{10,11}$/, {
        message: 'Số điện thoại phải có 10-11 chữ số',
      })
      .optional(),
    bio: z
      .string()
      .max(500, { message: 'Tiểu sử không được quá 500 ký tự' })
      .optional(),
    gender: z.string().optional(),
    birthday: z.string().optional(),
  })
  .refine(
    (data) => {
      // Kiểm tra ít nhất một field được cung cấp
      return Object.values(data).some(
        (value) => value !== undefined && value !== null && value !== ''
      );
    },
    {
      message: 'Phải cung cấp ít nhất một trường để cập nhật',
    }
  );
