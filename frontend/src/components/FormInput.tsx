import React from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

interface FormInputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  name: string;
  error?: string;
  register?: UseFormRegisterReturn; // <- thêm prop register
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  placeholder,
  name,
  error,
  register,
}) => {
  return (
    <div className="flex flex-col mb-4">
      {label && (
        <label htmlFor={name} className="mb-1 font-semibold text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        placeholder={placeholder}
        {...register} // <- gắn register ở đây
        className={`rounded-md shadow-sm px-4 py-2 outline-0 transition duration-200 border ${
          error ? 'border-red-500' : 'border-gray-300'
        } focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
};

export default FormInput;
