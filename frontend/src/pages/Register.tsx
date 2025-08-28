import React, { useState } from 'react';
import type { ChangeEvent } from 'react';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import OtpInput from '../components/OtpInput';
import { requestOtp, verifyOtp } from '../services/authService';
import type { RegisterData } from '../types/auth';

const Register: React.FC = () => {
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
    try {
      await requestOtp(formData);
      setStep(2);
      alert('OTP đã gửi tới email');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await verifyOtp({ ...formData, otp });
      alert('Đăng ký thành công');
      setStep(1);
      setFormData({ username: '', email: '', password: '', phone: '' });
      setOtp('');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div className="ml-2 max-w-md mx-auto mt-20 p-6 border rounded shadow">
      {step === 1 ? (
        <>
          <h2 className="text-xl font-bold mb-4">Register</h2>
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
          <Button onClick={handleRequestOtp}>Send OTP</Button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Verify OTP</h2>
          <OtpInput length={6} onChange={setOtp} />
          <Button onClick={handleVerifyOtp} className="mt-4">
            Verify & Register
          </Button>
        </>
      )}
    </div>
  );
};

export default Register;
