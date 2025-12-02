import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  student: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  course: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  enrolledAt: { 
    type: Date, 
    default: Date.now 
  },
  progress: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  completed: { 
    type: Boolean, 
    default: false 
  },
  completedAt: { 
    type: Date 
  },
  lastAccessed: { 
    type: Date, 
    default: Date.now 
  },
  // Track completed lessons/materials
  completedMaterials: [{
    materialId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Ensure one enrollment per student per course
EnrollmentSchema.index({ student: 1, course: 1 }, { unique: true });

export default mongoose.models.Enrollment || mongoose.model('Enrollment', EnrollmentSchema);