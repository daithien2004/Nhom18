import bcrypt from 'bcrypt';

// Hash password
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// So sánh password
export const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Tạo password ngẫu nhiên
export const generateRandomPassword = () => {
  return Math.random().toString(36).slice(-8);
};

// Tạo password mới và hash
export const generateAndHashPassword = async () => {
  const newPassword = generateRandomPassword();
  const hashedPassword = await hashPassword(newPassword);
  
  return {
    plainPassword: newPassword,
    hashedPassword
  };
};
