import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import instance from '../api/axiosInstant';
import OtpInput from '../components/OtpInput';
import { toast } from 'react-toastify';
import { Loader2 } from 'lucide-react';
import {
  FormForgotPasswordRequestOtpSchema,
  FormForgotPasswordResetSchema,
} from '../schemas/FormForgotPasswordSchema';
import type {
  FormForgotPasswordRequestOtp,
  FormForgotPasswordReset,
} from '../schemas/FormForgotPasswordSchema';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

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
    setValue,
    formState: { errors: errorsReset, isValid: isResetValid },
    reset: resetReset,
  } = useForm<FormForgotPasswordReset>({
    resolver: zodResolver(FormForgotPasswordResetSchema),
    defaultValues: { email: '', otp: '' },
    mode: 'onChange',
  });

  // Đồng bộ email giữa 2 bước
  useEffect(() => {
    if (step === 1) {
      resetRequest();
      setEmail('');
    }
    if (step === 2 && email) {
      setValue('email', email);
    }
  }, [step, email, setValue, resetRequest]);

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
      await instance.post('/auth/forgot-password/reset', {
        email: data.email,
        otp: data.otp,
      });
      toast.success(
        'Xác thực thành công. Mật khẩu mới đã được gửi về email của bạn.'
      );
      resetReset();
      setStep(1);
      navigate('/login');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xác thực OTP thất bại');
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

        {step === 1 ? (
          <form
            onSubmit={handleSubmitRequest(onSubmitRequestOtp)}
            className="flex flex-col gap-4"
          >
            <h1 className="text-xl font-bold text-gray-800">
              Forgot your password?
            </h1>

            <p className="text-sm text-gray-600">
              Enter your email address and we'll send you an OTP to reset your
              password.
            </p>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                {...registerRequest('email')}
                className="w-full p-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
              />
              {errorsRequest.email && (
                <p className="text-sm text-red-500 mt-1">
                  {errorsRequest.email.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !isRequestValid}
            >
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              {loading ? 'Sending...' : 'Send OTP'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Remember your password?{' '}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-700 transition-all duration-300"
              >
                Sign in here
              </Link>
            </p>
          </form>
        ) : (
          <form
            onSubmit={handleSubmitReset(onSubmitVerifyOtp)}
            className="flex flex-col gap-4"
          >
            <h1 className="text-xl font-bold text-gray-800">Verify OTP</h1>

            <p className="text-sm text-gray-600">
              We've sent a verification code to <strong>{email}</strong>. Please
              enter it below.
            </p>

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Enter OTP Code
              </label>
              <div className="flex justify-center">
                <OtpInput
                  length={6}
                  register={registerReset('otp')}
                  onChange={(val) => setValue('otp', val)}
                />
              </div>
              {errorsReset.otp && (
                <p className="text-sm text-red-500 mt-2 text-center">
                  {errorsReset.otp.message}
                </p>
              )}
              {errorsReset.email && (
                <p className="text-sm text-red-500 mt-2 text-center">
                  {errorsReset.email.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              disabled={loading}
            >
              {loading && <Loader2 className="animate-spin w-4 h-4" />}
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-all duration-300 text-center"
            >
              Back to email entry
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
