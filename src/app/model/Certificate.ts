import mongoose from 'mongoose';

const CertificateSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  enrollmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enrollment',
    required: true
  },
  certificateId: {
    type: String,
    required: true,
    unique: true
  },
  studentName: {
    type: String,
    required: true
  },
  courseName: {
    type: String,
    required: true
  },
  instructorName: {
    type: String,
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  completionDate: {
    type: Date,
    required: true
  },
  certificateUrl: {
    type: String
  },
  verified: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: Object,
    default: {}
  }
});

// Generate certificate ID
CertificateSchema.pre('save', function(next) {
  if (!this.certificateId) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.certificateId = `CERT-${timestamp}-${random}`;
  }
  next();
});

export default mongoose.models.Certificate || mongoose.model('Certificate', CertificateSchema);