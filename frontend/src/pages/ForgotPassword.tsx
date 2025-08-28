import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import OtpInput from '../components/OtpInput';
import { createOtp, sendPassword } from '../services/authService';
import { useNavigate } from 'react-router-dom';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>('');
  const [otp, setOtp] = useState<string>('');

  const handleRequestOtp = async () => {
    try {
      await createOtp(email);
      alert('OTP đã được gửi tới email của bạn');
      setStep(2);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await sendPassword(email, otp);
      alert('Xác thực thành công. Mật khẩu mới đã được gửi về email của bạn.');
      setStep(1);
      setEmail('');
      setOtp('');

      navigate('/login');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 border rounded-2xl shadow-lg bg-white">
        {step === 1 ? (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">
              Forgot Password
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
            <Button className="w-full mt-4" onClick={handleRequestOtp}>
              Send OTP
            </Button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-center mb-6">Verify OTP</h2>
            <div className="flex justify-center mb-6">
              <OtpInput length={6} onChange={setOtp} />
            </div>
            <Button className="w-full" onClick={handleVerifyOtp}>
              Verify OTP
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
