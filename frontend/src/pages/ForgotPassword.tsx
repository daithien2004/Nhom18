import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import OtpInput from '../components/OtpInput';
import { forgotPasswordRequestOtp, forgotPasswordReset } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const handleRequestOtp = async () => {
    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await forgotPasswordRequestOtp(email);
      alert('OTP đã được gửi tới email của bạn');
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Gửi OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError('Vui lòng nhập OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await forgotPasswordReset(email, otp);
      alert('Xác thực thành công. Mật khẩu mới đã được gửi về email của bạn.');
      setStep(1);
      setEmail('');
      setOtp('');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 border rounded-2xl shadow-lg bg-white">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              Quên Mật Khẩu
            </h2>
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={email}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setEmail(e.target.value)
              }
            />
            <Button 
              className="w-full mt-4" 
              onClick={handleRequestOtp}
              disabled={loading}
            >
              {loading ? 'Đang gửi...' : 'Gửi OTP'}
            </Button>
            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Xác Thực OTP</h2>
            <div className="flex justify-center mb-6">
              <OtpInput length={6} onChange={setOtp} />
            </div>
            <Button 
              className="w-full" 
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? 'Đang xác thực...' : 'Xác Thực OTP'}
            </Button>
            {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
