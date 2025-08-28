import React, { useState } from "react";
import type { ChangeEvent } from "react";
import FormInput from "../components/FormInput";
import Button from "../components/Button";
import OtpInput from "../components/OtpInput";
import { createOtp, sendPassword } from "../services/authService";

const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<number>(1);
  const [email, setEmail] = useState<string>("");
  const [otp, setOtp] = useState<string>("");

  const handleRequestOtp = async () => {
    try {
      await createOtp(email);
      alert("OTP đã được gửi tới email của bạn");
      setStep(2);
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      await sendPassword(email, otp);
      alert("Xác thực thành công. Mật khẩu mới đã được gửi về email của bạn.");
      setStep(1);
      setEmail("");
      setOtp("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="ml-2 max-w-md mx-auto mt-20 p-6 border rounded shadow">
      {step === 1 ? (
        <>
          <h2 className="text-xl font-bold mb-4">Forgot Password</h2>
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
          />
          <Button onClick={handleRequestOtp}>Send OTP</Button>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Verify OTP</h2>
          <OtpInput length={6} onChange={setOtp} />
          <Button onClick={handleVerifyOtp} className="mt-4">
            Verify OTP
          </Button>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
