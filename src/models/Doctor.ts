import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IDoctor {
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: Date;
}

export interface IDoctorDocument extends IDoctor, Document {}

interface IDoctorModel extends Model<IDoctorDocument> {}

const doctorSchema = new Schema<IDoctorDocument, IDoctorModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    specialization: {
      type: String,
      required: [true, 'Specialization is required'],
      trim: true,
    },
    hospital: {
      type: String,
      required: [true, 'Hospital is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Full-text search across list columns
doctorSchema.index({ name: 'text', specialization: 'text', hospital: 'text' });

// Default list sort + date-range filters
doctorSchema.index({ createdAt: -1 });

// Filter + sort patterns used by /api/doctors
doctorSchema.index({ specialization: 1, createdAt: -1 });
doctorSchema.index({ hospital: 1, createdAt: -1 });

export const Doctor = mongoose.model<IDoctorDocument, IDoctorModel>(
  'Doctor',
  doctorSchema
);
