import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import instance from '../api/axiosInstant';
import FormInput from '../components/FormInput';
import OtpInput from '../components/OtpInput';
import Button from '../components/Button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
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
    formState: { errors: errorsRequest },
    reset: resetRequest,
  } = useForm<FormForgotPasswordRequestOtp>({
    resolver: zodResolver(FormForgotPasswordRequestOtpSchema),
  });

  // Form xác thực OTP
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    setValue,
    formState: { errors: errorsReset },
    reset: resetReset,
  } = useForm<FormForgotPasswordReset>({
    resolver: zodResolver(FormForgotPasswordResetSchema),
    defaultValues: { email: '', otp: '' },
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
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 border rounded-2xl shadow-lg bg-white">
        {step === 1 ? (
          <form
            onSubmit={handleSubmitRequest(onSubmitRequestOtp)}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-center mb-6">
              Quên Mật Khẩu
            </h2>

            <FormInput
              label="Email"
              name="email"
              type="email"
              placeholder="Nhập email của bạn"
              register={registerRequest('email')}
              error={errorsRequest.email?.message}
            />

            <Button type="submit" className="w-full mt-4" disabled={loading}>
              {loading ? 'Đang gửi...' : 'Gửi OTP'}
            </Button>
          </form>
        ) : (
          <form
            onSubmit={handleSubmitReset(onSubmitVerifyOtp)}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-center mb-6">
              Xác Thực OTP
            </h2>

            <OtpInput
              length={6}
              register={registerReset('otp')}
              onChange={(val) => setValue('otp', val)}
            />
            {errorsReset.otp && (
              <p className="text-red-500 text-xs mt-1">
                {errorsReset.otp.message}
              </p>
            )}
            {errorsReset.email && (
              <p className="text-red-500 text-xs mt-1">
                {errorsReset.email.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Đang xác thực...' : 'Xác Thực OTP'}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
