import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import instance from '../api/axiosInstant';
import OtpInput from '../components/OtpInput';
import { toast } from 'react-toastify';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import {
  FormForgotPasswordRequestOtpSchema,
  FormForgotPasswordResetSchema,
  FormNewPasswordSchema,
} from '../schemas/FormForgotPasswordSchema';
import type {
  FormForgotPasswordRequestOtp,
  FormForgotPasswordReset,
  FormNewPassword,
} from '../schemas/FormForgotPasswordSchema';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form gửi OTP
  const {
    register: registerRequest,
    handleSubmit: handleSubmitRequest,
    formState: { errors: errorsRequest, isValid: isRequestValid },
    reset: resetRequest,
  } = useForm<FormForgotPasswordRequestOtp>({
    resolver: zodResolver(FormForgotPasswordRequestOtpSchema),
    mode: 'onChange',
  });

  // Form xác thực OTP
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    setValue: setValueReset,
    formState: { errors: errorsReset },
    reset: resetReset,
  } = useForm<FormForgotPasswordReset>({
    resolver: zodResolver(FormForgotPasswordResetSchema),
    defaultValues: { email: '', otp: '' },
    mode: 'onChange',
  });

  // Form đặt mật khẩu mới
  const {
    register: registerNewPassword,
    handleSubmit: handleSubmitNewPassword,
    setValue: setValueNewPassword,
    formState: { errors: errorsNewPassword, isValid: isNewPasswordValid },
    reset: resetNewPassword,
  } = useForm<FormNewPassword>({
    resolver: zodResolver(FormNewPasswordSchema),
    defaultValues: { email: '', otp: '', newPassword: '', confirmPassword: '' },
    mode: 'onChange',
  });

  // Đồng bộ email và OTP giữa các bước
  useEffect(() => {
    if (step === 1) {
      resetRequest();
      setEmail('');
      setOtp('');
    }
    if (step === 2 && email) {
      setValueReset('email', email);
    }
    if (step === 3 && email && otp) {
      setValueNewPassword('email', email);
      setValueNewPassword('otp', otp);
    }
  }, [step, email, otp, setValueReset, setValueNewPassword, resetRequest]);

  const onSubmitRequestOtp = async (data: FormForgotPasswordRequestOtp) => {
    setLoading(true);
    try {
      await instance.post('/auth/forgot-password/request-otp', {
        email: data.email,
      });
      toast.success('OTP đã được gửi tới email của bạn');
      setEmail(data.email);
      setStep(2);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Gửi OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitVerifyOtp = async (data: FormForgotPasswordReset) => {
    setLoading(true);
    try {
      await instance.post('/auth/forgot-password/verify-otp', {
        email: data.email,
        otp: data.otp,
      });
      toast.success('Xác thực OTP thành công');
      setOtp(data.otp);
      setStep(3);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitNewPassword = async (data: FormNewPassword) => {
    setLoading(true);
    try {
      await instance.post('/auth/forgot-password/reset', {
        email: data.email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      toast.success('Đặt lại mật khẩu thành công');
      resetRequest();
      resetReset();
      resetNewPassword();
      setStep(1);
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Đặt lại mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-100">
      <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="hidden md:flex justify-center items-center">
          <img
            src="./img/logo.png"
            alt="Logo"
            className="max-w-full max-h-40 object-contain"
          />
        </div>

        {/* Step 1: Nhập Email */}
        {step === 1 && (
          <form
            onSubmit={handleSubmitRequest(onSubmitRequestOtp)}
            className="flex flex-col gap-4"
          >
            <h1 className="text-xl font-bold text-gray-800">Quên mật khẩu?</h1>
            <p className="text-sm text-gray-600">
              Nhập địa chỉ email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại
              mật khẩu.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Nhập email của bạn"
                {...registerRequest('email')}
                className="w-full p-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
              />
              {errorsRequest.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errorsRequest.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !isRequestValid}
            >
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              {loading ? 'Đang gửi...' : 'Gửi OTP'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Nhớ mật khẩu?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 transition-all duration-300"
              >
                Đăng nhập tại đây
              </Link>
            </p>
          </form>
        )}

        {/* Step 2: Xác thực OTP */}
        {step === 2 && (
          <form
            onSubmit={handleSubmitReset(onSubmitVerifyOtp)}
            className="flex flex-col gap-4"
          >
            <h1 className="text-xl font-bold text-gray-800">Xác thực OTP</h1>
            <p className="text-sm text-gray-600">
              Chúng tôi đã gửi mã xác thực đến <strong>{email}</strong>. Vui
              lòng nhập mã bên dưới.
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Nhập mã OTP
              </label>
              <div className="flex justify-center">
                <OtpInput
                  length={6}
                  register={registerReset('otp')}
                  onChange={(val) => setValueReset('otp', val)}
                />
              </div>
              {errorsReset.otp && (
                <p className="text-sm text-red-500 mt-2 text-center">
                  {errorsReset.otp.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              disabled={loading}
            >
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-all duration-300 text-center"
            >
              Quay lại nhập email
            </button>
          </form>
        )}

        {/* Step 3: Đặt mật khẩu mới */}
        {step === 3 && (
          <form
            onSubmit={handleSubmitNewPassword(onSubmitNewPassword)}
            className="flex flex-col gap-4"
          >
            <h1 className="text-xl font-bold text-gray-800">
              Đặt mật khẩu mới
            </h1>
            <p className="text-sm text-gray-600">
              Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
            </p>

            {/* Mật khẩu mới */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Mật khẩu mới
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu mới"
                  {...registerNewPassword('newPassword')}
                  className="w-full p-3 pr-10 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errorsNewPassword.newPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errorsNewPassword.newPassword.message}
                </p>
              )}
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu mới"
                  {...registerNewPassword('confirmPassword')}
                  className="w-full p-3 pr-10 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errorsNewPassword.confirmPassword && (
                <p className="text-sm text-red-500 mt-1">
                  {errorsNewPassword.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !isNewPasswordValid}
            >
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              {loading ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
            </button>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-all duration-300 text-center"
            >
              Quay lại xác thực OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
