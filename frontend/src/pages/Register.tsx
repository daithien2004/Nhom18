import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
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
import { Loader2 } from 'lucide-react';
import OtpInput from '../components/OtpInput';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [step, setStep] = useState<number>(1);

  // Form for step 1 (registration data)
  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    formState: { errors: formErrors, isValid: isFormValid },
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
    mode: 'onChange',
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
    mode: 'onChange',
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
    } else {
      const payload = resultAction.payload;
      if (payload && typeof payload === 'object') {
        if ('message' in payload && typeof payload.message === 'string') {
          toast.error(payload.message);
        }
      } else {
        toast.error('Gửi OTP thất bại!');
      }
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
    } else {
      const payload = resultAction.payload;
      if (payload && typeof payload === 'object') {
        if ('message' in payload && typeof payload.message === 'string') {
          toast.error(payload.message);
        }
      } else {
        toast.error('Xác thực OTP thất bại!');
      }
    }
  };

  const handleOtpChange = (otpValue: string) => {
    setOtpValue('otp', otpValue);
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
            onSubmit={handleSubmitForm(handleRequestOtp)}
            className="flex flex-col gap-4"
          >
            <h1 className="text-xl font-bold text-gray-800">
              Create your account
            </h1>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Username
              </label>
              <input
                placeholder="Enter your username"
                {...registerForm('username')}
                className="w-full p-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
              />
              {formErrors.username && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.username.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Email
              </label>
              <input
                type="email"
                placeholder="Enter your email"
                {...registerForm('email')}
                className="w-full p-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
              />
              {formErrors.email && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Password
              </label>
              <input
                type="password"
                placeholder="Enter your password"
                {...registerForm('password')}
                className="w-full p-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
              />
              {formErrors.password && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.password.message}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Phone
              </label>
              <input
                type="tel"
                placeholder="Enter your phone number"
                {...registerForm('phone')}
                className="w-full p-3 bg-gray-100 border-none rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all duration-300"
              />
              {formErrors.phone && (
                <p className="text-sm text-red-500 mt-1">
                  {formErrors.phone.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading.requestOtp || !isFormValid}
            >
              {loading.requestOtp && (
                <Loader2 className="animate-spin w-4 h-4" />
              )}
              {loading.requestOtp ? 'Sending OTP...' : 'Send OTP'}
            </button>

            <p className="text-sm text-gray-500 text-center">
              Already have an account?{' '}
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
            onSubmit={handleSubmitOtp(handleVerifyOtp)}
            className="flex flex-col gap-4"
          >
            <h1 className="text-xl font-bold text-gray-800">Verify OTP</h1>

            <p className="text-sm text-gray-600">
              We've sent a verification code to your email. Please enter it
              below.
            </p>

            {/* OTP Input */}
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-3">
                Enter OTP Code
              </label>
              <div className="flex justify-center">
                <OtpInput
                  length={6}
                  onChange={handleOtpChange}
                  register={registerOtp('otp')}
                />
              </div>
              {otpErrors.otp && (
                <p className="text-sm text-red-500 mt-2 text-center">
                  {otpErrors.otp.message}
                </p>
              )}
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 text-white font-medium rounded-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              disabled={loading.verifyOtp}
            >
              {loading.verifyOtp && (
                <Loader2 className="animate-spin w-4 h-4" />
              )}
              {loading.verifyOtp ? 'Verifying...' : 'Verify & Register'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-sm text-blue-600 hover:text-blue-700 transition-all duration-300 text-center"
            >
              Back to registration
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Register;
