import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
   name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'instructor'], required: true },
  educationLevel: { type: String }, // Optional, for students
  expertiseArea: { type: [String], default: [] },
 
});


userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});


userSchema.methods.comparePassword = async function (candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;