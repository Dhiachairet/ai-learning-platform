import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  price: { type: Number, default: 0 },
  status: { type: String, enum: ['draft', 'pending', 'approved', 'rejected', 'reported'], default: 'draft' },
  thumbnail: { type: String },
  lessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Course || mongoose.model('Course', CourseSchema);