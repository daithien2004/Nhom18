import React, { useState, useRef, useEffect } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface OtpInputProps {
  length?: number;
  onChange?: (otp: string) => void;
  register?: UseFormRegisterReturn; // Thêm prop register
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onChange,
  register,
}) => {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const val = e.target.value;
    if (/^\d*$/.test(val)) {
      const newOtp = [...otp];
      newOtp[index] = val;
      setOtp(newOtp);
      onChange?.(newOtp.join(''));

      if (val && index < length - 1) {
        inputsRef.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  // Đồng bộ với register nếu có
  useEffect(() => {
    if (register?.onChange) {
      register.onChange({ target: { value: otp.join('') } } as any);
    }
  }, [otp, register]);

  return (
    <div className="flex gap-2">
      {Array(length)
        .fill(0)
        .map((_, idx) => (
          <input
            key={idx}
            {...(register && idx === 0 ? register : {})} // gắn register vào input đầu tiên
            ref={(el) => {
              inputsRef.current[idx] = el;
              if (register && idx === 0 && register.ref) register.ref(el);
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={otp[idx]}
            onChange={(e) => handleChange(e, idx)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className="w-12 h-12 text-center border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        ))}
    </div>
  );
};

export default OtpInput;
