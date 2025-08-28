import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import OtpInput from '../components/OtpInput';
import type { RegisterData } from '../types/auth';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { requestOtpThunk, verifyOtpThunk } from '../store/slices/authSlice';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((s) => s.auth);

  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    phone: '',
  });
  const [otp, setOtp] = useState<string>('');

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOtp = async () => {
    const resultAction = await dispatch(requestOtpThunk(formData));
    if (requestOtpThunk.fulfilled.match(resultAction)) {
      alert('OTP đã gửi tới email');
      setStep(2);
    } else {
      alert(error || 'Gửi OTP thất bại');
    }
  };

  const handleVerifyOtp = async () => {
    const resultAction = await dispatch(verifyOtpThunk({ ...formData, otp }));
    if (verifyOtpThunk.fulfilled.match(resultAction)) {
      alert('Đăng ký thành công');
      setStep(1);
      setFormData({ username: '', email: '', password: '', phone: '' });
      setOtp('');
      navigate('/login');
    } else {
      alert(error || 'Xác thực OTP thất bại');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 border rounded-2xl shadow-lg bg-white">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
            <FormInput
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleChange}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
            />
            <FormInput
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
            />
            <FormInput
              label="Phone"
              name="phone"
              type="phone"
              value={formData.phone}
              onChange={handleChange}
            />
            <Button
              className="w-full mt-4"
              onClick={handleRequestOtp}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Verify OTP</h2>
            <div className="flex justify-center mb-6">
              <OtpInput length={6} onChange={setOtp} />
            </div>
            <Button
              className="w-full mt-2"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? 'Verifying...' : 'Verify & Register'}
            </Button>
            {error && <p className="text-red-500 mt-2">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
