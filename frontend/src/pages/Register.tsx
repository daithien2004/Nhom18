import React, { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import OtpInput from '../components/OtpInput';
import type { RegisterData } from '../types/auth';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { requestOtpThunk, verifyOtpThunk, clearError } from '../store/slices/authSlice';

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

  // Clear error when component mounts or step changes
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch, step]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRequestOtp = async () => {
    // Basic validation
    if (!formData.username || !formData.email || !formData.password || !formData.phone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const resultAction = await dispatch(requestOtpThunk(formData));
    if (requestOtpThunk.fulfilled.match(resultAction)) {
      alert('OTP đã gửi tới email');
      setStep(2);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      alert('Vui lòng nhập OTP');
      return;
    }

    const resultAction = await dispatch(verifyOtpThunk({ ...formData, otp }));
    if (verifyOtpThunk.fulfilled.match(resultAction)) {
      alert('Đăng ký thành công');
      setStep(1);
      setFormData({ username: '', email: '', password: '', phone: '' });
      setOtp('');
      navigate('/login');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 border rounded-2xl shadow-lg bg-white">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Đăng Ký</h2>
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
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
            <Button
              className="w-full mt-4"
              onClick={handleRequestOtp}
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi OTP'}
            </Button>
            {error && <p className="text-red-500 mt-2 text-center">{error.message || error}</p>}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Xác Thực OTP</h2>
            <div className="flex justify-center mb-6">
              <OtpInput length={6} onChange={setOtp} />
            </div>
            <Button
              className="w-full mt-2"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? 'Đang xác thực...' : 'Xác Thực & Đăng Ký'}
            </Button>
            {error && <p className="text-red-500 mt-2 text-center">{error.message || error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
