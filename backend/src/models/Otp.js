import { Schema, model } from 'mongoose';

const otpSchema = new Schema({
  email: { type: String, require: true },
  otp: { type: String, require: true },
  expiresAT: { type: Date, require: true },
});

export default model('Otp', otpSchema);
