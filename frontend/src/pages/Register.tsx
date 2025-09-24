import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import OtpInput from '../components/OtpInput';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearError } from '../store/slices/authSlice';
import { requestOtpThunk, verifyOtpThunk } from '../store/thunks/authThunks';
import {
  FormRegisterRequestOtpSchema,
  FormRegisterVerifyOtpSchema,
  type FormRegisterRequestOtp,
  type FormRegisterVerifyOtp,
} from '../schemas/FormRegisterSchema';
import { toast } from 'react-toastify';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [step, setStep] = useState<number>(1);

  // Form for step 1 (registration data)
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    formState: { errors: formErrors },
    getValues: getFormValues,
    reset: resetForm,
  } = useForm<FormRegisterRequestOtp>({
    resolver: zodResolver(FormRegisterRequestOtpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      phone: '',
    },
  });

  // Form for step 2 (OTP verification)
  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    formState: { errors: otpErrors },
    reset: resetOtp,
    setValue: setOtpValue,
  } = useForm<FormRegisterVerifyOtp>({
    resolver: zodResolver(FormRegisterVerifyOtpSchema),
    defaultValues: {
      otp: '',
    },
  });

  // Clear error when component mounts or step changes
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, step]);

  const handleRequestOtp = async (data: FormRegisterRequestOtp) => {
    const formData = {
      username: data.username,
      email: data.email,
      password: data.password,
      phone: data.phone,
    };

    const resultAction = await dispatch(requestOtpThunk(formData));
    if (requestOtpThunk.fulfilled.match(resultAction)) {
      toast.success('OTP đã gửi tới email');
      setStep(2);
    }
  };

  const handleVerifyOtp = async (data: FormRegisterVerifyOtp) => {
    const formValues = getFormValues();
    const completeData = {
      username: formValues.username,
      email: formValues.email,
      password: formValues.password,
      phone: formValues.phone,
      otp: data.otp,
    };

    const resultAction = await dispatch(verifyOtpThunk(completeData));
    if (verifyOtpThunk.fulfilled.match(resultAction)) {
      toast.success('Đăng ký thành công');
      setStep(1);
      resetForm();
      resetOtp();
      navigate('/login');
    }
  };

  const handleOtpChange = (otpValue: string) => {
    setOtpValue('otp', otpValue);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 border rounded-2xl shadow-lg bg-white">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Đăng Ký</h2>
            <form onSubmit={handleSubmitForm(handleRequestOtp)}>
              <FormInput
                label="Username"
                name="username"
                register={registerForm('username')}
                error={formErrors.username?.message}
              />
              <FormInput
                label="Email"
                name="email"
                type="email"
                register={registerForm('email')}
                error={formErrors.email?.message}
              />
              <FormInput
                label="Password"
                name="password"
                type="password"
                register={registerForm('password')}
                error={formErrors.password?.message}
              />
              <FormInput
                label="Phone"
                name="phone"
                type="tel"
                register={registerForm('phone')}
                error={formErrors.phone?.message}
              />
              <Button
                type="submit"
                className="w-full mt-4"
                disabled={loading.requestOtp}
              >
                {loading.requestOtp ? 'Đang gửi...' : 'Gửi OTP'}
              </Button>
            </form>
            {error && (
              <p className="text-red-500 mt-2 text-center">{error.message}</p>
            )}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              Xác Thực OTP
            </h2>
            <form onSubmit={handleSubmitOtp(handleVerifyOtp)}>
              <div className="flex justify-center mb-6">
                <OtpInput
                  length={6}
                  onChange={handleOtpChange}
                  register={registerOtp('otp')}
                />
              </div>
              {otpErrors.otp && (
                <p className="text-red-500 text-center mb-4">
                  {otpErrors.otp.message}
                </p>
              )}
              <Button
                type="submit"
                className="w-full mt-2"
                disabled={loading.verifyOtp}
              >
                {loading.verifyOtp ? 'Đang xác thực...' : 'Xác Thực & Đăng Ký'}
              </Button>
            </form>
            {error && (
              <p className="text-red-500 mt-2 text-center">{error.message}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
