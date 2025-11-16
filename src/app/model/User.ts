import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String },
  password: { type: String },
  role: { 
    type: String, 
    enum: ['student', 'instructor', 'admin', ''],
    default: ''
  },
  educationLevel: { type: String },
  expertiseArea: { type: [String], default: [] },
}, {
  timestamps: true
});

userSchema.pre('save', async function (next) {
  // ✅ FIX: Only hash if password is modified AND not already hashed
  if (this.isModified('password') && this.password) {
    // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, etc.)
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
      if (this.password !== 'google-oauth') {
        this.password = await bcrypt.hash(this.password, 10);
      }
    }
  }
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string) {
  if (!this.password) return false;
  if (this.password === 'google-oauth') return false;
  
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;