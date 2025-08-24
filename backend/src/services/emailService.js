import nodemailer from 'nodemailer';

export const sendOtpEmail = async (to, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"ZaloUTE" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Your OTP Code',
    text: `Mã OTP của bạn là: ${otp}. Mã sẽ hết hạn sau 5 phút.`,
  };

  await transporter.sendMail(mailOptions);
};
